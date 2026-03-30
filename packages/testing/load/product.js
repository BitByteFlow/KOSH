import http from 'k6/http';
import { sleep } from 'k6';

export const option = {
  iterations: 10,
};

const URL = _ENV_URL;
console.log('this url is :', URL);

export default function () {
  const payload = JSON.stringify({
    name: 'bibke',
  });
  http.get('http://localhost:4000');

  sleep(1);
}
