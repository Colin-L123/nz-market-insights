import requests

FX_API_URL = "https://api.frankfurter.dev/v1/latest"
HEADERS = {
    # 1. 告诉服务器你是谁（最重要的伪装，表明你是 Windows 上的 Chrome 浏览器）
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        
    # 3. 告诉服务器你接受的语言（优先返回英文或中文网页，避免返回乱码）
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    
    # 4. 告诉服务器你是从哪个页面点过来的（防盗链/防爬经常检查这个，选填）
    "Referer": "https://www.google.com/"
}
def fetch_page(url: str) -> dict:
    """fetch currency exchange rate"""
    response = requests.get(url, headers=HEADERS, params={"base": "NZD", "symbols": "USD,EUR,CNY,AUD,GBP,JPY,SGD"}, timeout=10)
    response.raise_for_status()#check for status code, 200/400/500?
    return response.json()

if __name__ == "__main__":
    print (fetch_page(FX_API_URL))