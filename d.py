import asyncio
from playwright.async_api import async_playwright
async def m():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1280,"height":800})
    await pg.goto("http://localhost:8080/"); await pg.wait_for_timeout(5000)
    await pg.screenshot(path="l.png",clip={"x":0,"y":0,"width":1280,"height":700})
    await pg.get_by_label("Toggle dark mode").click(); await pg.wait_for_timeout(1500)
    await pg.screenshot(path="d.png",clip={"x":0,"y":0,"width":1280,"height":700}); await b.close()
asyncio.run(m())
