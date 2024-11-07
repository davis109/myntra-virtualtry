# Repo: https://huggingface.co/spaces/levihsu/OOTDiffusion/tree/main
# Deployed at (scroll to bottom for API access): https://huggingface.co/spaces/levihsu/OOTDiffusion

from gradio_client import Client, handle_file

client = Client("levihsu/OOTDiffusion")
result = client.predict(
		vton_img=handle_file('C:\\Users\\a21ma\\AppData\\Local\\Temp\\gradio\\a9d0de4e1bc63ed239ca59b70054eac8ef9301c2\\image.webp'),
		garm_img=handle_file('https://levihsu-ootdiffusion.hf.space/file=/tmp/gradio/6d146b53fc7c97805abdb1d761458ed335c899f3/051988_1.jpg'),
		category="Lower-body",
		n_samples=1,
		n_steps=20,
		image_scale=2,
		seed=-1,
		api_name="/process_dc"
)
print(result)