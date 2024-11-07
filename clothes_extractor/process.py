from u2net_model import U2NET
import os
from PIL import Image
import cv2
import argparse
import numpy as np
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from collections import OrderedDict
import requests
from io import BytesIO
import pandas as pd

def load_checkpoint(model, checkpoint_path):
    if not os.path.exists(checkpoint_path):
        print("----No checkpoints at given path----")
        return
    model_state_dict = torch.load(checkpoint_path, map_location=torch.device("cpu"))
    new_state_dict = OrderedDict()
    for k, v in model_state_dict.items():
        name = k[7:]
        new_state_dict[name] = v
    model.load_state_dict(new_state_dict)
    print("----checkpoints loaded from path: {}----".format(checkpoint_path))
    return model

def get_palette(num_cls):
    n = num_cls
    palette = [0] * (n * 3)
    for j in range(0, n):
        lab = j
        palette[j * 3 + 0] = 0
        palette[j * 3 + 1] = 0
        palette[j * 3 + 2] = 0
        i = 0
        while lab:
            palette[j * 3 + 0] |= (((lab >> 0) & 1) << (7 - i))
            palette[j * 3 + 1] |= (((lab >> 1) & 1) << (7 - i))
            palette[j * 3 + 2] |= (((lab >> 2) & 1) << (7 - i))
            i += 1
            lab >>= 3
    return palette

class Normalize_image(object):
    def __init__(self, mean, std):
        assert isinstance(mean, (float))
        if isinstance(mean, float):
            self.mean = mean
        if isinstance(std, float):
            self.std = std
        self.normalize_1 = transforms.Normalize(self.mean, self.std)
        self.normalize_3 = transforms.Normalize([self.mean] * 3, [self.std] * 3)
        self.normalize_18 = transforms.Normalize([self.mean] * 18, [self.std] * 18)

    def __call__(self, image_tensor):
        if image_tensor.shape[0] == 1:
            return self.normalize_1(image_tensor)
        elif image_tensor.shape[0] == 3:
            return self.normalize_3(image_tensor)
        elif image_tensor.shape[0] == 18:
            return self.normalize_18(image_tensor)
        else:
            assert "Please set proper channels! Normlization implemented only for 1, 3 and 18"

def apply_transform(img):
    transforms_list = []
    transforms_list += [transforms.ToTensor()]
    transforms_list += [Normalize_image(0.5, 0.5)]
    transform_rgb = transforms.Compose(transforms_list)
    return transform_rgb(img)

def generate_mask(input_image, net, palette, device='cpu'):
    img = input_image
    img_size = img.size
    img = img.resize((768, 768), Image.BICUBIC)
    image_tensor = apply_transform(img)
    image_tensor = torch.unsqueeze(image_tensor, 0)

    with torch.no_grad():
        output_tensor = net(image_tensor.to(device))
        output_tensor = F.log_softmax(output_tensor[0], dim=1)
        output_tensor = torch.max(output_tensor, dim=1, keepdim=True)[1]
        output_tensor = torch.squeeze(output_tensor, dim=0)
        output_arr = output_tensor.cpu().numpy()

    classes_to_save = []

    for cls in range(1, 4):
        if np.any(output_arr == cls):
            classes_to_save.append(cls)

    alpha_masks = []
    for cls in classes_to_save:
        alpha_mask = (output_arr == cls).astype(np.uint8) * 255
        alpha_mask = alpha_mask[0]
        alpha_masks.append(alpha_mask)

    if alpha_masks:
        combined_alpha_mask = np.max(alpha_masks, axis=0)
    else:
        combined_alpha_mask = np.zeros_like(output_arr[0], dtype=np.uint8)
    combined_alpha_mask = Image.fromarray(combined_alpha_mask, mode='L')
    combined_alpha_mask = combined_alpha_mask.resize(img_size, Image.BICUBIC)
    cloth_seg = Image.fromarray(output_arr[0].astype(np.uint8), mode='P')
    cloth_seg.putpalette(palette)
    cloth_seg = cloth_seg.resize(img_size, Image.BICUBIC)
    return combined_alpha_mask, cloth_seg

def load_seg_model(checkpoint_path, device='cpu'):
    net = U2NET(in_ch=3, out_ch=4)
    net = load_checkpoint(net, checkpoint_path)
    net = net.to(device)
    net = net.eval()
    return net

def save_transparent_image(image_pil, alpha_mask, final_output_with_white_bg_path):
    original_image = np.array(image_pil.convert('RGBA'))
    alpha_mask = cv2.resize(alpha_mask, (original_image.shape[1], original_image.shape[0]))

    if original_image.shape[2] == 4:  
        transparent_image = np.concatenate([original_image[:, :, :3], np.expand_dims(alpha_mask, axis=2)], axis=2)
    else:
        transparent_image = np.concatenate([original_image[:, :, :3], np.expand_dims(alpha_mask, axis=2)], axis=2)

    if transparent_image.shape[2] == 4:
        b, g, r, a = cv2.split(transparent_image)
        white_background = np.ones_like(transparent_image[:, :, :3]) * 255
        alpha = a / 255.0
        alpha_inv = 1.0 - alpha
        for c in range(3):
            white_background[:, :, c] = (alpha * transparent_image[:, :, c] + alpha_inv * white_background[:, :, c])
        cv2.imwrite(final_output_with_white_bg_path, white_background)
    else:
        cv2.imwrite(final_output_with_white_bg_path, transparent_image)

output_dir = './output/'
os.makedirs(output_dir, exist_ok=True)

def download_image(url):
    try:
        response = requests.get(url)
        image = Image.open(BytesIO(response.content))
        return image
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return None

def process_and_save_image(img_url, product_id,id, model, palette):
    img = download_image(img_url)
    if img is None:
        return
    img = img.convert('RGB')
    combined_alpha_mask, cloth_seg_image = generate_mask(img, model, palette)
    alpha_mask = np.array(combined_alpha_mask)
    output_path = os.path.join(output_dir, f"{id}_extracted.png")
    
    save_transparent_image(img, alpha_mask, output_path)


def main(args):
    csv_file = 'products_final_data.csv'
    df = pd.read_csv(csv_file)
    device = 'cuda:0' if args.cuda else 'cpu'
    model = load_seg_model(args.checkpoint_path, device=device)
    palette = get_palette(4)
    for index, row in df.iterrows():
        img_url = row['img']
        product_id = row['product_id']
        id=row['ID']
        process_and_save_image(img_url, product_id,id, model, palette)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process images for Cloth Segmentation.')
    parser.add_argument('--cuda', action='store_true', help='Enable CUDA (default: False)')
    parser.add_argument('--checkpoint_path', type=str, default='model/cloth_segm.pth', help='Path to the checkpoint file')
    args = parser.parse_args()
    main(args)
