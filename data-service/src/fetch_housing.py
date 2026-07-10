import csv, io, requests

AFFORADBILITY_CSV_URL = "https://catalogue.data.govt.nz/dataset/d9585bff-7f6a-49c5-8fb0-5a6ce23e32c7/resource/b760a594-4f45-4b95-9a16-25c0a3300632/download/data_govt_output.csv"
SALE_PRICE_CSV_URL = "https://catalogue.data.govt.nz/dataset/urban-development/resource/956fbc8c-5723-4ec4-a8a5-7192cbbbaad1/download/ratio_eua_gw_out_2026-06-30.csv"

HEADERS = {
    # 1. 告诉服务器你是谁（最重要的伪装，表明你是 Windows 上的 Chrome 浏览器）
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        
    # 3. 告诉服务器你接受的语言（优先返回英文或中文网页，避免返回乱码）
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    
    # 4. 告诉服务器你是从哪个页面点过来的（防盗链/防爬经常检查这个，选填）
    "Referer": "https://www.google.com/"
}

def fetch_page(url:str) -> str:
    """fetch housing indicator csv"""
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def parse_csv(text:str) -> list[dict]:
    """change csv to list"""
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)

if __name__ == "__main__":
    affordability = parse_csv(fetch_page(AFFORADBILITY_CSV_URL))
    sale_prices = parse_csv(fetch_page(SALE_PRICE_CSV_URL))

    print(f"afforadbility: {len(affordability)} row")
    for row in affordability[:3]:
        print(row)

    print(f"sale proice: {len(sale_prices)} row")
    for row in sale_prices[:3]:
        print(row)
