import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule, AbstractControl, ValidationErrors
} from '@angular/forms';
import {NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../services/user.service";
import {StorageService} from "../../services/storage.service";
import {Preferences} from "@capacitor/preferences";
import {SharedPrefsPlugin} from "shared-prefs-plugin/src";
import {Capacitor} from "@capacitor/core";

export interface Pass { // renamed from lowercase version
  vlcPass: string,
}

export interface User {
  icon?: string;
  buttenName?: string;
  hide: boolean;
  ipAddress: string;
}


@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
  styleUrls: ['./account.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    FormsModule,
  ],
})
export class AccountPage implements OnInit {
  username: string;
  ipaddress: string;
  vlcpassword: string;
  myForm: FormGroup;
  user: User;
  addVlc: User;

  userSettings: User[] = [{
    ipAddress: '192.168.2.2:8080', hide: false
  }, {
    ipAddress: '192.168.2.2:8081', hide: false
  }];


  public getterdata: User[] = [];
  configForm: any = {ipAddress: 'http://localhost'};
  vlcPass: string = '';
  // Replaced static basePrefix with configurable segments & localhost toggle
  useLocalhost: boolean = false;
  // Private backing fields for IP segments & port with validation enforced in setters
  private _segment1: string = '192';
  private _segment2: string = '168';
  private _segment3: string = '2';
  private _segment4: string = '2';
  private _port: string = '8080';

  // Getters/Setters enforce: up to 3 numeric digits, 0-255 for segments, 1-65535 for port
  get segment1(): string { return this._segment1; }
  set segment1(val: string) { this._segment1 = this.setOctet(val, this._segment1); }
  get segment2(): string { return this._segment2; }
  set segment2(val: string) { this._segment2 = this.setOctet(val, this._segment2); }
  get segment3(): string { return this._segment3; }
  set segment3(val: string) { this._segment3 = this.setOctet(val, this._segment3); }
  get segment4(): string { return this._segment4; }
  set segment4(val: string) { this._segment4 = this.setOctet(val, this._segment4); }
  get port(): string { return this._port; }
  set port(val: string) {
    const v = this.norm(val);
    if (/^\d{1,5}$/.test(v)) {
      const n = Number(v);
      if (!Number.isNaN(n) && n >= 1 && n <= 65535) { this._port = v; }
    }
  }

  get basePrefix(): string { return this.useLocalhost ? this.configForm.ipAddress : `http://${this.segment1}.${this.segment2}.${this.segment3}`; }

  constructor(
    private readonly userService: UserService, // marked readonly
    public storageServive: StorageService,
    public router: Router,
    private readonly fb: FormBuilder) { // marked readonly
  }

  ngOnInit() {
    this.getJson(1);
    this.user = this.userService;
    this.configForm = this.userService;
    if (this.configForm.ipAddress === undefined) {
      this.configForm.ipAddress = "http://localhost";
    }


    //1. FormBuilder
    this.myForm = this.fb.group({
      ipAddress: ['', this.ipValidator],
    });

    // 2. FormControl, FormGroup,
    this.myForm = new FormGroup({
      ipAddress: new FormControl('', this.ipValidator),
    });

    this.userSettings = [...this.userSettings, this.addVlc]
  }

  setHide(i: number) {
    this.getterdata[i].hide = !this.getterdata[i].hide;
    this.setJson(1);
  }

  setJson(setter: number) {

    if (setter == 1) {
      this.getJson(setter).then(() => console.log("getting before setting: "));
      const portVal = this.norm(this.port);
      const portNum = Number(portVal || '8080');
      if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) { console.warn('Invalid port (1-65535)'); return; }
      let fullUrl: string;
      if (this.useLocalhost) {
        fullUrl = `${this.basePrefix}:${portNum}/mobile.html`;
      } else {
        if (!this.validateSegments()) { console.warn('Invalid segment (0-255)'); return; }
        const segment4Str = this.norm(this.segment4);
        if (!segment4Str) { console.warn('No last octet provided'); return; }
        const segment4Num = Number(segment4Str);
        if (Number.isNaN(segment4Num) || segment4Num < 0 || segment4Num > 255) { console.warn('Invalid last octet (0-255)'); return; }
        fullUrl = `${this.basePrefix}.${segment4Num}:${portNum}/mobile.html`;
      }
      const ip = [{ ipAddress: fullUrl, hide: this.user?.hide || false }];
      if (this.getterdata.some(v => v.ipAddress === fullUrl)) {
        console.log('%c Duplicate IP, skipping add.', 'color:#f0f;', fullUrl);
      } else {
        this.getterdata = [...this.getterdata, ...ip].filter(v => v.ipAddress);
        this.storageServive.setData('VLC', this.getterdata).then(() => {});
      }
    }
    this.getJson(setter).then(() => console.log("getting after setting: "));
  }

  async getJson(getter: number) {
    if (getter == 1) {
      await this.storageServive.getData("VLC").then((data: any) => {

        let res;
        if (data.value) {
          res = JSON.parse(data.value);

          this.getterdata = res

          console.log("%c 1 --> 135||C:/workspace/projects/VLC-Android/src/app/pages/account/account.ts\n this.getterdata: ", "color:#f0f;", this.getterdata);
        }
      });
    }

  }

  async delJson(i) {
    await this.storageServive.delData("VLC");
    let foo_object = this.getterdata[i];
    this.getterdata = this.getterdata.filter(obj => {
      return obj !== foo_object
    });
  }

  async getPass(x) {
    if (x === 1) {
      if (Capacitor.getPlatform() === 'android') {
        const result = await SharedPrefsPlugin.getPreference({ key: 'pass' });
        this.vlcPass = result.value || 'no password'
        console.log('Pass value from Android:', result.value);
      } else {
        const result = await Preferences.get({key: 'pass'})
        this.vlcPass = result.value || 'no password'
        console.log('Pass value from Web:', result.value);
      }
    }

    if (x === 2) {
      if (Capacitor.getPlatform() === 'android') {
        await SharedPrefsPlugin.setPreference({
          key: 'pass',
          value: this.vlcPass || '1z2x'
        });
      } else {
        await Preferences.set({
          key: 'pass',
          value: this.vlcPass || '1z2x',
        });
      }
    }
  }

  setLocalhost(){
    this.useLocalhost = !this.useLocalhost;
  }
  ipValidator(control: AbstractControl): ValidationErrors | null { // simplified signature
    const value = (control.value || '').toString();
    const regex = /^(?:\d{1,3}\.){3}\d{1,3}:(?:6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|\d{1,4})$/;
    return regex.test(value) ? null : { ipAddress: true };
  }

  // Helpers used by template
  builtPreview(): string {
    const p = this.norm(this.port) || '8080';
    if (this.useLocalhost) return `${this.basePrefix}:${p}/mobile.html`;
    const last = this.norm(this.segment4) || 'x';
    return `${this.basePrefix}.${last}:${p}/mobile.html`;
  }
  validateSegment(s: string): boolean {
    const v = this.norm(s);
    if (!/^\d{1,3}$/.test(v)) return false;
    const n = Number(v);
    return !Number.isNaN(n) && n >= 0 && n <= 255;
  }
  validateSegments(): boolean { return this.validateSegment(this.segment1) && this.validateSegment(this.segment2) && this.validateSegment(this.segment3); }
  validateLastOctet(): boolean { return this.useLocalhost || this.validateSegment(this.segment4); }
  validatePort(): boolean {
    const v = this.norm(this.port);
    if (!/^\d{1,5}$/.test(v)) return false;
    const n = Number(v);
    return !Number.isNaN(n) && n >= 1 && n <= 65535;
  }
  validateReady(): boolean { return this.useLocalhost ? this.validatePort() : (this.validateSegments() && this.validateLastOctet() && this.validatePort()); }

  private norm(val: any): string { return (val === null || val === undefined ? '' : String(val)).trim(); }
  // Helper to set an IP octet with validation (0-255, up to 3 digits). Returns previous value if invalid.
  private setOctet(input: string, current: string): string {
    const v = this.norm(input);
    if (!/^\d{1,3}$/.test(v)) return current;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0 || n > 255) return current;
    return v;
  }
  // Active enforcement from template (ionInput) to cap length & numeric chars before setter range check
  enforceOctet(field: 'segment1'|'segment2'|'segment3'|'segment4', raw: string) {
    const cleaned = (raw || '').replace(/\D/g,'').slice(0,3);
    switch(field){
      case 'segment1': this.segment1 = cleaned; break;
      case 'segment2': this.segment2 = cleaned; break;
      case 'segment3': this.segment3 = cleaned; break;
      case 'segment4': this.segment4 = cleaned; break;
    }
  }
  enforcePort(raw: string) {
    const cleaned = (raw || '').replace(/\D/g,'').slice(0,5);
    this.port = cleaned;
  }
}
