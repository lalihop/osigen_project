import json
from services.crawler.searchengine import SearchEngine

class SearchCrtsh(SearchEngine):
    def __init__(self, word):
        self.domain = word
        self.totalhosts = []

    async def do_search(self):
        url = f"https://crt.sh/?q=%25.{self.domain}&output=json"
        response = await self.fetch(url)
        if response is None:
            return
        try:
            json_resp = json.loads(response)
        except Exception:
            return

        for record in json_resp:
            entry = record.get("name_value", "")
            for subdomain in entry.split("\n"):
                if subdomain.endswith(self.domain) and "*" not in subdomain:
                    self.totalhosts.append(subdomain)
