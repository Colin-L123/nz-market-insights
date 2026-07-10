import requests
from bs4 import BeautifulSoup

# URL = "https://www.bnz.co.nz/personal-banking/investments/rates"
BNZ_API_URL = "https://api.bnz.co.nz/v3/termdeposits/rates"#真实去抓的网站，拿到json数据
HEADERS = {
    # 1. 告诉服务器你是谁（最重要的伪装，表明你是 Windows 上的 Chrome 浏览器）
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    
    # 2. 告诉服务器你接收什么格式的数据（有助于顺畅拿到网页）
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    
    # 3. 告诉服务器你接受的语言（优先返回英文或中文网页，避免返回乱码）
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    
    # 4. 告诉服务器你是从哪个页面点过来的（防盗链/防爬经常检查这个，选填）
    "Referer": "https://www.google.com/",

    "apikey": "vjqaLG3y07VHpZnIe8nYX808FGPYid8G"
}

def deduplicate(items: list[dict], key) -> list[dict]:
    """Remove duplicate items, using key(item) to decide what counts as duplicate."""
    seen = set()
    result = []
    for item in items:
        identifier = key(item)
        if identifier not in seen:
            seen.add(identifier)
            result.append(item)
    return result

def fetch_page(url:str) -> dict:  
    """Download the json from a given URL."""
    response = requests.get(url, headers= HEADERS, timeout=10)
    response.raise_for_status()
    return response.json()

def parse_prices(data: dict) -> list[dict]:
    """Extract item name + price pairs from the page HTML."""
    items = []
    for item in data["rates"]:
        term = item["term"]
        rate = item["cardedInterestRate"]
        items.append({"term": f"{term["duration"]} {term["unit"]}", "rate": rate})
    return deduplicate(sorted(items, key = lambda x: x["rate"]), key = lambda x: x["rate"])

if __name__ == "__main__":
    data  = fetch_page(BNZ_API_URL)
    # print(html)
    for item in parse_prices(data):
        print(item)