use headless_chrome::{Browser, LaunchOptionsBuilder};
use serde::Serialize;
use rand::seq::SliceRandom; // 添加随机选择功能

#[derive(Serialize)]
struct Ret {
    success: bool,
    message: Option<String>,
    data: Option<String>, // 网页内容或错误信息
}

// 生成随机 User-Agent 的函数
fn get_random_user_agent() -> &'static str {
    let user_agents = [
        // Chrome (Windows)
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        
        // Chrome (macOS)
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        
        // Chrome (Linux)
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        
        // Firefox (Windows)
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
        
        // Firefox (macOS)
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
        
        // Safari (macOS)
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
        
        // Edge (Windows)
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
        
        // Mobile User Agents
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36",
        
        // Opera
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    ];
    
    user_agents.choose(&mut rand::thread_rng()).unwrap_or(&user_agents[0])
}

#[tauri::command]
async fn fetch_url(url: String) -> Result<Ret, String> {
    println!("fetch website : {}", url);

    let launch_options = LaunchOptionsBuilder::default()
        .headless(true) // Ensure it runs headless
        .build()
        .unwrap();

    // 使用 match 处理错误
    match Browser::new(launch_options) {
        Ok(browser) => {
            match browser.new_tab() {
                Ok(tab) => {
                    // 使用随机 User-Agent
                    let user_agent = get_random_user_agent();
                    println!("使用 User-Agent: {}", user_agent);
                    
                    if let Err(e) = tab.set_user_agent(user_agent, None, None) {
                        return Ok(Ret {
                            success: false,
                            message: Some(format!("设置User-Agent失败: {}", e)),
                            data: None,
                        });
                    }

                    if let Err(e) = tab.navigate_to(&url) {
                        return Ok(Ret {
                            success: false,
                            message: Some(format!("导航到URL失败: {}", e)),
                            data: None,
                        });
                    }

                    if let Err(e) = tab.wait_until_navigated() {
                        return Ok(Ret {
                            success: false,
                            message: Some(format!("等待页面加载失败: {}", e)),
                            data: None,
                        });
                    }

                    // 获取网页内容
                    match tab.get_content() {
                        Ok(content) => Ok(Ret {
                            success: true,
                            message: Some("成功获取网页内容".to_string()),
                            data: Some(content),
                        }),
                        Err(e) => Ok(Ret {
                            success: false,
                            message: Some(format!("获取网页内容失败: {}", e)),
                            data: None,
                        }),
                    }
                }
                Err(e) => Ok(Ret {
                    success: false,
                    message: Some(format!("创建新标签页失败: {}", e)),
                    data: None,
                }),
            }
        }
        Err(e) => Ok(Ret {
            success: false,
            message: Some(format!("启动浏览器失败: {}", e)),
            data: None,
        }),
    }
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
        },
        Err(e) => Ok(Ret {
            success: false,
            message: Some(format!("请求失败: {}", e)),
            data: None,
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![fetch_url, http_get])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
