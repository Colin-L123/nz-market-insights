import json
import anthropic
from dotenv import load_dotenv
from analyze import get_all_summaries

INDICATORS = ["inflation_rate", "gdp_growth_rate", "unemployment_rate"]

def generate_summary(summaries: dict) -> str:
    load_dotenv()
    client = anthropic.Anthropic()
    prompt = f"""以下是新西兰最新经济指标数据：
    {json.dumps(summaries, indent=2, ensure_ascii=False)}
    请从资深宏观经济分析师角度，用中文写一段150字左右的经济态势总结，需包含：
    1. 开篇一句话概括当前经济整体态势；
    2. 分别简要解读通胀率、GDP增速、失业率、汇率（如人民币兑纽币/美元走势）等指标的走势及含义;
    3. 给出未来半年到1年的趋势判断（延续、转折信号是什么）；
    4. 给出以下五方面的务实建议：
        - 投资（大类资产配置方向）
        - 购房（境内/境外购房时机）
        - 理财（现金/储蓄类工具选择）
        - 工作/就业
        - 跨境资金配置：结合汇率走势，简要提示当前是否为将人民币兑换转移至新西兰（或增加境内投资）的相对合适时点，说明理由（如汇率是否处于有利区间、换汇便利性、政策限制等）
        语言简洁专业易懂"""
    try:
        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except anthropic.APIError as e:
        return f"API 调用失败: {e}"

if __name__ == "__main__":
    load_dotenv()
    print(generate_summary(get_all_summaries()))