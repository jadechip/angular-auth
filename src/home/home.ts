import { Component, View } from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';
import { Http, Headers } from 'angular2/http';
import { AuthHttp } from 'angular2-jwt';
import { Router } from 'angular2/router';
import { domainUrl } from '../common/domainUrl';
import { Socket } from 'phoenix-elixir';


let styles = require('./home.css');
let template = require('./home.html');


@Component({
  selector: 'home'
})
@View({
  directives: [CORE_DIRECTIVES],
  template: template,
  styles: [styles]
})
export class Home {
  jwt: string;
  decodedJwt: string;
  response: string;
  api: string;
  metrics: object;

  constructor(public router: Router, public http: Http, public authHttp: AuthHttp) {
    this.jwt = localStorage.getItem('auth-token');
    // http.defaults.headers.common.Authorization = this.jwt;
    // this.decodedJwt = this.jwt && window.jwt_decode(this.jwt);
  }

  logout() {
    localStorage.removeItem('auth-token');
    this.router.parent.navigateByUrl('/login');
  }


  callAnonymousApi() {
    // this._callApi('Anonymous', 'http://localhost:3001/api/random-quote');
    if (this.jwt) {
      var authHeader = new Headers();
      authHeader.append('auth-token', this.jwt);
    } else {
      return;
    }

    this.http.get(domainUrl + '/api/metrics', {
      headers: authHeader
    }).map(res => res.json()).subscribe(
      data => this.metrics = data,
      err => this.logError(err),
      () => console.log(this.metrics)
    );
  }

  callSecuredApi() {
    // this._callApi('Secured', 'http://localhost:3001/api/protected/random-quote');

    let socket = new Socket("ws://frontend-test.aircloak.com/updates", { params: { "auth-token": this.jwt } })
    socket.connect()

    console.log(socket);

    let channel = socket.channel("updates:new", {})
    channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })

    channel.on("update", payload => {
      console.log("Received: " + payload);
      console.log(payload);
    })

  }


  logError(err) {
    console.error('There was an error: ' + err);
  }

  _callApi(type, url) {
    this.response = null;
    if (type === 'Anonymous') {
      // For non-protected routes, just use Http
      this.http.get(url)
        .subscribe(
          response => this.response = response.text(),
          error => this.response = error.text()
        );
    }
    if (type === 'Secured') {
      // For protected routes, use AuthHttp
      this.authHttp.get(url)
        .subscribe(
          response => this.response = response.text(),
          error => this.response = error.text()
        );
    }
  }
}
