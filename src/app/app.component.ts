import { Component } from '@angular/core';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'GotBot-chat';
  newMessage = '';
  users: any;

  constructor(private chatService: ChatService) {}

  /*getUsers(){
    this.chatService.getUsers().then((res) => {
      this.users = res;
    }, (err) => {
      console.log(err);
    });
  }*/

}
