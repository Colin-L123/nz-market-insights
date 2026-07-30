import xml.etree.ElementTree as ET
import requests
from fetch_bank_rates import HEADERS

BNZ_LOAN_API_URL = "https://api.bnz.co.nz/v1/ratesfeed/home/xml"

def fetch_loan_page(url: str) -> str:
    """Download the raw XML text from a given URL.""" 
    response = requests.get(url, headers=HEADERS,timeout=10)
    response.raise_for_status()
    return response.text

def parse_loan_rates(xml_text: str)->list[dict]:
    """Extract product/term/rate from the BNZ home loan rates XML feed."""
    root = ET.fromstring(xml_text)
    items = []
    for rate_elem in root.iter("rate"):
        label = rate_elem.find("label").text.strip()
        term = rate_elem.find("term").text.strip()
        rate = float(rate_elem.find("interest").text)
        items.append({"product": label,"term": term,"rate":rate})
    return items

if __name__ == "__main__":
    xml_text = fetch_loan_page(BNZ_LOAN_API_URL)
    for item in parse_loan_rates(xml_text):
        print(item) 