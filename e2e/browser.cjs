const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext();
 const page=await context.newPage();
 let alerts=[];page.on('dialog',async d=>{alerts.push(d.message());await d.accept()});
 const payload='<img src=x onerror="alert(\'XSS check\')">';
 for(const mode of ['vulnerable','protected']){
  for(const kind of ['reflected','dom']){
   alerts=[];
   await page.goto('http://localhost:3000/'+mode+(kind==='dom'?'#'+encodeURIComponent(payload):'?search='+encodeURIComponent(payload)));
   await page.waitForTimeout(400);
   assert.equal(alerts.length>0,mode==='vulnerable',mode+' '+kind);
   console.log(mode,kind,'passed');
  }
 }
 for(const mode of ['vulnerable','protected']){
  await page.goto('http://localhost:3000/'+mode);
  await page.getByPlaceholder('Comment',{exact:true}).fill(payload);
  alerts=[];
  await page.getByRole('button',{name:'Add comment',exact:true}).click();
  await page.waitForTimeout(400);
  assert.equal(alerts.length>0,mode==='vulnerable',mode+' stored');
  console.log(mode,'stored passed');
  await page.getByRole('button',{name:'Login',exact:true}).click();
  await page.getByText('Login successful',{exact:true}).waitFor();
  const attacker=await context.newPage();await attacker.goto('http://localhost:4000');
  const popupPromise=context.waitForEvent('page');
  await attacker.getByRole('button',{name:'CSRF против '+mode,exact:true}).click();
  const popup=await popupPromise;await popup.waitForLoadState();
  const body=await popup.locator('body').innerText();
  assert.ok(mode==='vulnerable'?body.includes('attacker@example.com'):body.includes('Invalid request origin'));
  await popup.close();await attacker.close();
  await page.getByRole('button',{name:'Refresh profile',exact:true}).click();
  await page.waitForTimeout(200);
  assert.ok((await page.locator('body').innerText()).includes(mode==='vulnerable'?'student, attacker@example.com':'student, student@example.com'));
  await page.getByPlaceholder('new@example.com',{exact:true}).fill('legitimate@example.com');
  await page.getByRole('button',{name:'Change email',exact:true}).click();
  await page.getByText('Email changed',{exact:true}).waitFor();
  console.log(mode,'csrf attack and legitimate update passed');
 }
 await page.goto('http://localhost:3000/vulnerable');
 const navigation=page.waitForResponse(r=>r.url()==='http://localhost:3000/protected'&&r.request().resourceType()==='document');
 await page.getByRole('link',{name:'Protected',exact:true}).click();
 assert.ok((await navigation).headers()['content-security-policy']);
 console.log('Full navigation with CSP passed');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
