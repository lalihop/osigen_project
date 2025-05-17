# dnssearch.py
import socket
import asyncio
import random
import os
from typing import List
import dns.resolver
import aiohttp

class DNSModule:
    def __init__(self, domain: str, wordlist_path: str = None):
        self.domain = domain

        if wordlist_path is None:
            currunt_dir = os.path.dirname(os.path.abspath(__file__))
            self.wordlist_path = os.path.join(currunt_dir, "wordlist.txt")
        else:
            self.wordlist_path = wordlist_path

        self.wordlist: List[str] = []
        self.localhosts: List[str] = []
        self.externalhosts: List[str] = []
        self._load_wordlist()

    def _load_wordlist(self):
        try:
            with open(self.wordlist_path, "r", encoding="utf-8") as f:
                self.wordlist = list(set(f.read().splitlines()))  # 중복 제거
        except FileNotFoundError:
            print(f"[!] 워드리스트 파일 '{self.wordlist_path}'를 찾을 수 없습니다.")

    def resolve_local(self, subdomain: str) -> bool:
        try:
            socket.gethostbyname(subdomain)
            return True
        except socket.gaierror:
            return False

    async def check_http_alive(self, subdomain: str) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"http://{subdomain}", timeout=3) as resp:
                    return resp.status < 500
        except Exception:
            return False

    async def resolve_external(self, subdomain: str) -> bool:
        try:
            resolver = dns.resolver.Resolver()
            resolver.nameservers = ['8.8.8.8']
            resolver.timeout = 2
            resolver.lifetime = 3

            answer = resolver.resolve(subdomain, 'A')
            if answer and any(a.address for a in answer):
                # DNS 응답은 있지만, 실제 HTTP 요청 응답이 있는지도 확인
                if await self.check_http_alive(subdomain):
                    return True
            return False
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer,
                dns.resolver.NoNameservers, dns.resolver.Timeout):
            return False
        except Exception as e:
            print(f"[오류] {subdomain} 확인 중 예외 발생: {e}")
            return False

    async def run_local(self):
        print(f"[🔍] Local DNS Brute-force 시작...")
        for word in self.wordlist:
            sub = f"{word}.{self.domain}"
            if self.resolve_local(sub):
                self.localhosts.append(sub)
            await asyncio.sleep(random.uniform(0.1, 0.3))
        return self.localhosts

    async def run_external(self):
        print(f"[🔍] External DNS Brute-force 시작...")
        for word in self.wordlist:
            sub = f"{word}.{self.domain}"
            if await self.resolve_external(sub):
                self.externalhosts.append(sub)
            await asyncio.sleep(random.uniform(0.2, 0.4))
        return self.externalhosts

    def merge_results(self):
        # local + external 교집합 기반 최종 결과
        verified_hosts = sorted(set(self.localhosts) & (set(self.externalhosts)))
        return verified_hosts
