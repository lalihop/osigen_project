import asyncio

from services.crawler.crtsh import SearchCrtsh
from services.crawler.bingsearch import SearchBing
from services.crawler.googlesearch import SearchGoogle
from services.crawler.dnssearch import DNSModule

def is_valid_subdomain(sub: str, domain: str) -> bool:
    return (
        '@' not in sub and
        (sub == domain or sub.endswith("." + domain))
    )

async def run_all(domain):
    print(f"[>] 도메인: {domain}")

    all_subdomains = set()

    try:
        print("\n[🔍] crt.sh 검색 중...")
        crt = SearchCrtsh(domain)
        await crt.do_search()
        all_subdomains.update(crt.totalhosts)
    except Exception as e:
        print(f"[!] crt.sh 크롤링 실패: {e}")

    try:
        print("\n[🔍] Google 검색 중...")
        google = SearchGoogle(domain)
        await google.do_search()
        all_subdomains.update(google.totalhosts)
    except Exception as e:
        print(f"[!] Google 검색 실패: {e}")

    try:
        print("\n[🔍] Bing 검색 중...")
        bing = SearchBing(domain)
        await bing.do_search()
        all_subdomains.update(bing.totalhosts)
    except Exception as e:
        print(f"[!] Bing 검색 실패: {e}")

    try:
        dns_brute = DNSModule(domain)
        await dns_brute.run_local()
        await dns_brute.run_external()
        verified_subdomains = dns_brute.merge_results()
        all_subdomains.update(verified_subdomains)
    except Exception as e:
        print(f"[!] DNS 브루트포스 실패: {e}")

    print(f"\n[v] 서브 도메인 수집 완료!")

    # 필터링 적용
    filtered = [s for s in all_subdomains if is_valid_subdomain(s, domain)]
    print(f"[>] 발견한 서브 도메인의 개수: {len(filtered)}\n")

    if not filtered:
        raise Exception("모든 크롤러가 실패했거나 유효한 서브도메인을 찾지 못했습니다.")

    with open(f"{domain}_subdomains.txt", "w") as f:
        f.write(f"[>] the number of discovered subdomain: {len(filtered)}\n")
        for sub in sorted(filtered):
            f.write(sub + "\n")

    return {"subdomains": filtered}

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("사용법: python main.py example.com")
        exit()
    target_domain = sys.argv[1]
    asyncio.run(run_all(target_domain))
