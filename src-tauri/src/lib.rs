// 标准库导入

use serde::Serialize;

// 数据结构定义
#[derive(Serialize)]
pub struct Ret {
    success: bool,
    message: Option<String>,
    data: Option<String>, // 网页内容或错误信息
}

#[tauri::command]
async fn http_get(url: String, headers: Option<serde_json::Value>) -> Result<Ret, String> {
    println!("发起GET请求: {}", url);

    let client = reqwest::Client::new();
    let mut request_builder = client.get(&url);

    // 如果提供了headers，添加到请求中
    if let Some(headers_value) = headers {
        if let Some(headers_obj) = headers_value.as_object() {
            for (key, value) in headers_obj {
                if let Some(value_str) = value.as_str() {
                    request_builder = request_builder.header(key, value_str);
                }
            }
        }
    }

    // 发送请求并处理响应
    match request_builder.send().await {
        Ok(response) => {
            let status = response.status();

            // 尝试获取响应内容
            match response.text().await {
                Ok(text) => Ok(Ret {
                    success: status.is_success(),
                    message: Some(format!("请求状态码: {}", status)),
                    data: Some(text),
                }),
                Err(e) => Ok(Ret {
                    success: false,
                    message: Some(format!("读取响应内容失败: {}", e)),
                    data: None,
                }),
            }
        }
        Err(e) => Ok(Ret {
            success: false,
            message: Some(format!("请求失败: {}", e)),
            data: None,
        }),
    }
}

// Tauri 应用入口点
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![http_get])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
