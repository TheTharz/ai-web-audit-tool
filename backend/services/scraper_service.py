import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

async def scrape_url(url:str):

  #for a headless browser replace this with a playwright one
  #playwright load the browser
  #then feed that in to beautifulsoup
  #otherwise video like things wont loaded because modern apps use spas with js
  headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
    }
  
  async with httpx.AsyncClient(follow_redirects=True,headers=headers) as client:
    response = await client.get(url=url)
    response.raise_for_status() #raise if there is a http error

    html_content = response.text

  soup = BeautifulSoup(html_content,"html.parser")

  # 1. Text Analysis
  text = soup.get_text(separator=' ', strip=True)
  word_count = len(text.split())

    # 2. Heading Counts
  headings = {
        "h1": len(soup.find_all("h1")),
        "h2": len(soup.find_all("h2")),
        "h3": len(soup.find_all("h3")),
    }

    # 3. Links Analysis
  base_domain = urlparse(url).netloc
  all_links = soup.find_all("a", href=True)
  internal = [l for l in all_links if base_domain in urlparse(urljoin(url, l['href'])).netloc]
  external = len(all_links) - len(internal)

    # 4. Images & Alt Text
  images = soup.find_all("img")
  total_images = len(images)
  missing_alt = len([img for img in images if not img.get('alt')])
  alt_missing_percent = (missing_alt / total_images * 100) if total_images > 0 else 0

    # 5. Metadata
  meta_title = soup.title.string if soup.title else "No title found"
  meta_desc = soup.find("meta", {"name": "description"})
  meta_desc = meta_desc["content"] if meta_desc else "No description found"

    # 6. CTAs (Buttons or links that look like buttons)
    # Marketing sites usually use classes like 'btn', 'button', 'cta'
  ctas = soup.find_all(["button", "a"], class_=lambda x: x and any(c in x.lower() for c in ['btn', 'button', 'cta']))

  return {
        "word_count": word_count,
        "headings": headings,
        "internal_links": len(internal),
        "external_links": external,
        "total_images": total_images,
        "alt_missing_percent": round(alt_missing_percent, 2),
        "meta_title": meta_title,
        "meta_description": meta_desc,
        "cta_count": len(ctas),
        "raw_content": text[:3000]  # First 3k chars for AI context
    }
