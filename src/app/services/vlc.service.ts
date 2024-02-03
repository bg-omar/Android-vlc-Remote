
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ITodo } from '../models/todo.model';
import { Preferences } from '@capacitor/preferences';
import {CapacitorHttp, HttpResponse} from '@capacitor/core';

// Example of a GET request
const doGet = async () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: {'X-Fake-Header': 'Fake-Value'},
    params: {size: 'XL'},
  };
  const response: HttpResponse = await CapacitorHttp.get(options);

  // or...
  // const response = await CapacitorHttp.request({ ...options, method: 'GET' })
};

// Example of a POST request. Note: data
// can be passed as a raw JS Object (must be JSON serializable)
const doPost = async () => {
  const options = {
    url: 'https://example.com/my/api',
    headers: {'X-Fake-Header': 'Fake-Value'},
    data: {foo: 'bar'},
  };

  const response: HttpResponse = await CapacitorHttp.post(options);

  // or...
  // const response = await CapacitorHttp.request({ ...options, method: 'POST' })
};

const setName = async () => {
  await Preferences.set({
    key: 'name',
    value: 'Max',
  });
};

const checkName = async () => {
  const { value } = await Preferences.get({ key: 'name' });

  console.log(`Hello ${value}!`);
};

const removeName = async () => {
  await Preferences.remove({ key: 'name' });
};

const URL_PREFIX = "http://localhost:3000";
@Injectable({
  providedIn: 'root'
})

export class VlcService {

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Array<ITodo>> {
    return this.http.get<Array<ITodo>>(`${URL_PREFIX}/todos`,);
  }

  getTodo(id: string): Observable<ITodo> {
    return this.http.get<ITodo>(`${URL_PREFIX}/todos/${id}`);
  }


  addTodo(todo: ITodo) {
    //debugger
    return this.http.post(`${URL_PREFIX}/todos`, todo)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error.message);
          return throwError("Error while creating a todo" + error.message);
        }));
  }


  updateTodo(todo: ITodo, id: string): Observable<ITodo> {
    return this.http.put<ITodo>(`${URL_PREFIX}/todos/${id}`, todo)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // this.errorHandler.log("Error while updating a todo", error);
          console.log(error.message);
          return throwError("Error while updating a todo " + error.message);
        }));
  }

  deleteTodo(id: string) {
    return this.http.delete(`${URL_PREFIX}/todos/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error.message);
        return throwError("Error while deleting a todo " + error.message);
      }));
  }
}
