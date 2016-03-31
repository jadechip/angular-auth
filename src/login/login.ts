import { Component, View } from 'angular2/core';
import { Router, RouterLink } from 'angular2/router';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { Http, Headers } from 'angular2/http';
import { contentHeaders } from '../common/headers';
import { domainUrl } from '../common/domainUrl';

let styles   = require('./login.css');
let template = require('./login.html');

@Component({
  selector: 'login'
})
@View({
  directives: [RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES ],
  template: template,
  styles: [ styles ]
})
export class Login {
  constructor(public router: Router, public http: Http) {
  }

  login(event, username, password) {
    event.preventDefault();
    let payload = JSON.stringify({ username, password });
    console.log(payload);
    this.http.post(domainUrl + '/api/auth', payload, { headers: contentHeaders })
      .subscribe(
        response => {
          console.log('auth token is this', response.json()['auth-token']);
          localStorage.setItem('auth-token', response.json()['auth-token']);
          // $http.defaults.headers.common.Authorization = response.json()['auth-token'];
          this.router.parent.navigateByUrl('/home');
        },
        error => {
          alert(error.text());
          console.log(error.text());
        }
      );
  }

  signup(event) {
    event.preventDefault();
    this.router.parent.navigateByUrl('/signup');
  }
}
