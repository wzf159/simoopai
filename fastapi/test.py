import requests

url = "http://localhost:8000/files/"
data = {
    "id": "test",
    "content": {"key": "value"}
}

response = requests.post(url, json=data)
print(response.json())