import fetch from 'node-fetch';
async function test() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/1q-oA61Ba4fYMvkT5EycxhQPZjmMIoA-F2OaAZiyTdl4/export?format=csv");
  const text = await res.text();
  console.log(text.split('\n').slice(0, 5).join('\n'));
}
test();
