const { chromium } = require('./node_modules/playwright');
const { mkdirSync } = require('fs');
mkdirSync('test-results', { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto('http://localhost:3399/manage');
  await page.waitForTimeout(500);

  const noSession = await page.locator('text=아직 예산 결과가 없어요').isVisible().catch(() => false);
  if (noSession) {
    await page.evaluate(() => {
      localStorage.setItem('budgetroad_manage_session', JSON.stringify({
        answers: { q1:'a',q2:'a',q3:'a',q4:'a',q5:'a',q6:'a',q7:'a',q8:'a', budget:'3000', guests:'100', region:'서울' },
        toggles: {}
      }));
    });
    await page.reload();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'test-results/01-loaded.png' });

  const addBtn = page.locator('button:has-text("+ 항목 추가")').first();
  if (!await addBtn.isVisible().catch(() => false)) {
    console.log('BLOCKED: + 항목 추가 버튼 없음');
    await browser.close(); return;
  }

  await addBtn.click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'test-results/02-input-shown.png' });

  const input = page.locator('input[placeholder="항목 이름 입력"]');
  await input.fill('테스트항목ZZZ');

  // 추가 버튼: dark background button (입력 옆의 "추가")
  const submitBtn = page.locator('div.flex.items-center.gap-2 button:has-text("추가")');
  await submitBtn.click();
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'test-results/03-after-add.png' });

  const immediate = await page.locator('text=테스트항목ZZZ').isVisible().catch(() => false);
  console.log('immediately_visible:', immediate);

  if (!immediate) {
    await page.locator('button:has-text("편집")').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/04-in-edit.png' });
    const inEdit = await page.locator('text=테스트항목ZZZ').isVisible().catch(() => false);
    console.log('visible_in_edit:', inEdit);
    await page.locator('button:has-text("완료")').click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'test-results/05-after-exit.png' });
    const afterExit = await page.locator('text=테스트항목ZZZ').isVisible().catch(() => false);
    console.log('visible_after_exit_edit:', afterExit);
    console.log('\nRESULT: FAIL');
  } else {
    console.log('\nRESULT: PASS');
  }

  await browser.close();
})();
