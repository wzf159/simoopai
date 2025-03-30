import os
# 在文件顶部添加导入
from fastapi import FastAPI, HTTPException, Request, File, UploadFile
import json
import requests
import hashlib
import random
import string

app = FastAPI()

# 定义文件存储的文件夹路径
FOLDER_PATH = "./files"

# 创建文件夹（如果不存在）
if not os.path.exists(FOLDER_PATH):
    os.makedirs(FOLDER_PATH)

# 新增或覆盖文件
@app.post("/files/")
async def create_or_update_file(request: Request):
    try:
        # 直接从请求中获取JSON数据
        file_data = await request.json()
        # 假设请求数据中包含 'id' 字段
        file_id = file_data.get('id')
        if not file_id:
            raise HTTPException(status_code=422, detail="Missing 'id' field in request data.")
        file_name = f"{file_id}.json"
        file_path = os.path.join(FOLDER_PATH, file_name)
        with open(file_path, 'w') as file:
            json.dump(file_data, file)
        return {"message": f"File {file_name} {'created' if not os.path.exists(file_path) else 'updated'} successfully."}
    except Exception as e:
        raise HTTPException(status_code=555, detail=f"Error {'creating' if not os.path.exists(file_path) else 'updating'} file: {str(e)}")

# 更新文件
@app.put("/files/{file_id}")
async def update_file(file_id: str, request: Request):
    file_name = f"{file_id}.json"
    file_path = os.path.join(FOLDER_PATH, file_name)
    if os.path.exists(file_path):
        try:
            # 读取原文件内容
            with open(file_path, 'r') as file:
                existing_file_data = json.load(file)
            # 直接从请求中获取JSON数据
            new_file_data = await request.json()
            # 合并新旧数据
            updated_file_data = {**existing_file_data, **new_file_data}
            # 将合并后的数据写回文件
            with open(file_path, 'w') as file:
                json.dump(updated_file_data, file)
            return {"message": f"File {file_name} updated successfully."}
        except Exception as e:
            raise HTTPException(status_code=555, detail=f"Error updating file: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_name} not found.")

# 删除文件
@app.delete("/files/{file_id}")
async def delete_file(file_id: str):
    file_name = f"{file_id}.json"
    file_path = os.path.join(FOLDER_PATH, file_name)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return {"message": f"File {file_name} deleted successfully."}
        except Exception as e:
            raise HTTPException(status_code=555, detail=f"Error deleting file: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_name} not found.")

# 查询文件
@app.get("/files/{file_id}")
async def read_file(file_id: str):
    file_name = f"{file_id}.json"
    file_path = os.path.join(FOLDER_PATH, file_name)
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as file:
                content = json.load(file)
            return content
        except Exception as e:
            raise HTTPException(status_code=555, detail=f"Error reading file: {str(e)}")
    else:
        raise HTTPException(status_code=404, detail=f"File {file_name} not found.")

# 替换为你自己的 APP ID 和密钥
appid = '20250326002316189'
secret = 'Gr2CFqiXIL5dtMRzJ4fr'

@app.get("/translate/")
async def translate_chinese_to_english(text: str):
    salt = ''.join(random.choices(string.ascii_letters + string.digits, k=7))
    sign = hashlib.md5(f"{appid}{text}{salt}{secret}".encode()).hexdigest()
    api_url = 'https://fanyi-api.baidu.com/api/trans/vip/translate'

    try:
        response = requests.get(api_url, params={
            'q': text,
            'from': 'zh',
            'to': 'en',
            'appid': appid,
            'salt': salt,
            'sign': sign
        })
        
       
        if response.status_code == 200 and 'trans_result' in response.json():
            return {"translation": response.json()['trans_result'][0]['dst']}
        else:
            raise HTTPException(status_code=555, detail=f"Translation failed: {response.json()}")
    except Exception as e:
        raise HTTPException(status_code=555, detail=f"Request error: {str(e)}")


# 添加图片上传目录
IMAGE_PATH = "./files/images"
if not os.path.exists(IMAGE_PATH):
    os.makedirs(IMAGE_PATH)

import time
@app.post("/files/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 生成唯一文件名
        # 改为文件名+下划线+时间戳的形式，确保文件名唯一 不用hashlib
        timestamp = int(time.time())
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{os.path.splitext(file.filename)[0]}_{timestamp}.{file_ext}"
        file_path = os.path.join(IMAGE_PATH, file_name)
        # file_name = f"{hashlib.md5(file.filename.encode()).hexdigest()}{file_ext}"
        # file_path = os.path.join(IMAGE_PATH, file_name)
        
        # 保存文件
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        # 返回文件URL
        return {"url": f"/files/images/{file_name}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

# 添加静态文件服务
from fastapi.staticfiles import StaticFiles
app.mount("/files/images", StaticFiles(directory="./files/images"), name="images")

