import requests
import aiohttp
import asyncio

# 시도할 URL 조합 (우선순위 있음)
PREFIXES = ["https://", "https://www.", "http://", "http://www."]

def try_request(url: str, timeout: int = 5) -> dict:
    try:
        response = requests.get(url, timeout=timeout, allow_redirects=True)
        redirect_chain = [r.url for r in response.history]  # 전체 리디렉션 경로

        return {
            "url": url,
            "alive": True,
            "status_code": response.status_code,
            "redirect_to": response.url if response.url != url else None,
            "redirect_chain": redirect_chain,
            "error": None
        }
    except requests.exceptions.ConnectTimeout:
        return {
            "url": url,
            "alive": False,
            "status_code": None,
            "redirect_to": None,
            "error": "TIMEOUT"
        }
    except requests.exceptions.ConnectionError:
        return {
            "url": url,
            "alive": False,
            "status_code": None,
            "redirect_to": None,
            "error": "CONNECTION_ERROR"
        }
    except requests.exceptions.InvalidURL:
        return {
            "url": url,
            "alive": False,
            "status_code": None,
            "redirect_to": None,
            "error": "INVALID_URL"
        }
    except Exception as e:
        return {
            "url": url,
            "alive": False,
            "status_code": None,
            "redirect_to": None,
            "error": f"UNKNOWN_ERROR: {str(e)}"
        }

def determine_primary_url(domain: str) -> dict:
    attempts = []
    for prefix in PREFIXES:
        url = prefix + domain
        result = try_request(url)
        attempts.append(result)

    # 1. 리디렉션된 주소가 있는 경우 → 대표 주소는 최종 리디렉션된 주소
    for result in attempts:
        if result["redirect_to"]:
            return {
                "domain": domain,
                "primary_url": result["redirect_to"],
                "attempts": attempts
            }
        
    # 2. https 우선 처리
    https_result = next((r for r in attempts if r["alive"] and r["url"].startswith("https://")), None)
    http_result = next((r for r in attempts if r["alive"] and r["url"].startswith("http://")), None)

    if https_result and http_result:
        return {
            "domain": domain,
            "primary_url": https_result["url"],
            "attempts": attempts
        }

    # 3. www와 non-www 모두 살아있고, 서로 다른 주소인 경우 → www 우선
    www_result = next((r for r in attempts if "://www." in r["url"] and r["alive"]), None)
    non_www_result = next((r for r in attempts if "://www." not in r["url"] and r["alive"]), None)

    if www_result and non_www_result:
        return {
            "domain": domain,
            "primary_url": www_result["url"],
            "attempts": attempts
        }

    # 4. 가장 먼저 살아있는 주소 사용
    alive_first = next((r for r in attempts if r["alive"]), None)
    return {
        "domain": domain,
        "primary_url": alive_first["url"] if alive_first else None,
        "attempts": attempts
    }

# 비동기 요청 함수 추가
async def async_try_request(url: str, timeout: int = 5) -> tuple[str, bool]:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=timeout) as resp:
                return url, resp.status < 500
    except Exception:
        return url, False

async def filter_subdomains_async(subdomain_list: list) -> list:
    urls = [f"http://{sub}" for sub in subdomain_list]

    results = await asyncio.gather(
        *[async_try_request(url) for url in urls],
        return_exceptions=True
    )

    valid_subs = []
    for i, result in enumerate(results):
        if isinstance(result, tuple) and result[1]:  # (url, alive)
            valid_subs.append(subdomain_list[i])

    return valid_subs