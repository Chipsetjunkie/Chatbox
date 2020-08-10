import React from 'react';
import uuidv4 from 'uuid/v4';
import {Segment, Input, Button} from "semantic-ui-react";
import firebase from '../Firebase';
import ProgressBar from './ProgressBar';
import FileModal from'./FileModal';
import 'emoji-mart/css/emoji-mart.css';
import { Picker, emojiIndex } from 'emoji-mart';


class MessageForm extends React.Component{
  state = {
    percentUpload:0,
    storageRef:firebase.storage().ref(),
    uploadState:'',
    uploadTask:null,
    message:'',
    loading:false,
    channel: this.props.channel,
    user:this.props.user,
    errors:[],
    modal:false,
    typingRef:firebase.database().ref('typing'),
    emojiPicker:false
  }

  componentWillUnmount(){
    if(this.state.uploadTask !== null){
      this.state.uploadTask.cancel()
      this.setState({uploadTask:null})
    }
  }

  openModal = () => {
      this.setState({modal:true})
  }

  closeModal = () => {
      this.setState({modal:false})
  }


  changeHandler = event =>{
      this.setState({[event.target.name]:event.target.value})
  }

  getPath = () =>{
      if(this.props.isPrivateChannel){
        return `chat/private/${this.state.channel.id}`;
      }else{
        return `chat/public`
      }
  }

  uploadFile = (file,metadata) =>{
      const pathToUpload = this.state.channel.id;
      const ref = this.props.getMessagesRef();
      const filePath = `${this.getPath()}/${uuidv4()}.jpg`

      console.log("file",file)
      this.setState({
        uploadState:'uploading',
        uploadTask:this.state.storageRef.child(filePath).put(file,metadata)
      },
      () => {
        console.log("entered state hange")
        this.state.uploadTask.on('state_changed',snap =>{
            const percentUpload = Math.round((snap.bytesTransferred/snap.totalBytes)*100)
            this.props.isProgresBarVisible(percentUpload)
            this.setState({percentUpload});

        },
        err => {
          console.error(err);
          this.setState({
            errors:this.state.errors.concat(err),
            uploadState:'error',
            uploadTask:null
          })
        },
        () => {
          console.log("after change")
            this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl =>{
              this.sendFileMessage(downloadUrl,ref,pathToUpload)
            })
            .catch(err =>{
              console.error(err);
              this.setState({
                errors:this.state.errors.concat(err),
                uploadState:'error',
                uploadTask:null
              })
            })
        }


      )

      })
  };

  sendFileMessage = (fileUrl,ref,pathToUpload) =>{
      ref.child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(()=> {
          this.setState({uploadState:'done'})
      })
      .catch(err =>{
          console.error(err);
          this.setState({
            errors:this.state.errors.concat(err)
          })
      })
  }

  createMessage = (fileUrl=null) =>{
    const message = {
        timestamp:firebase.database.ServerValue.TIMESTAMP,
        user:{
            id:this.state.user.uid,
            name:this.state.user.displayName
        },
      };
        if(fileUrl !== null){
            message['image'] = fileUrl;
        }
        else{
            message['content']=this.state.message
        }
        return message
    };

  sendMessage = () =>{
      const {getMessagesRef}= this.props
      const {message,channel,user,typingRef} = this.state

      if(message){
          this.setState({loading:true})
          getMessagesRef()
          .child(channel.id)
          .push()
          .set(this.createMessage())
          .then(() => {
            this.setState({loading:false,message:'',errors:[]})
            typingRef
            .child(channel.id)
            .child(user.uid)
            .remove()
          })
          .catch(err =>{
            console.error(err)
            this.setState({
              loading:false,
              errors:this.state.errors.concat(err)
            })
          })
      }
      else{
        this.setState({
          errors:this.state.errors.concat({message:'add a message'})
        })
      }
  }


  handleKeyDown = event => {
    if(event.keyCode===13){
      this.sendMessage();
    }
      const {message,typingRef,channel,user} = this.state;
      if(message){
        console.log("entered type add")
        typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName)
      }
      else{
        console.log("entered type remove")
        typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
      }
  }

  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = Object.keys(emojiIndex.emojis[x]).length === 8?emojiIndex.emojis[x] : emojiIndex.emojis[x][1];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        console.log(typeof unicode)
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };


  handleAddEmoji=emoji=>{
    const oldMessage = this.state.message
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `).trim();
    this.setState({message:newMessage, emojiPicker:false})
    setTimeout(()=>this.messageInputRef.focus(),0);
  }

  handleToggle = () =>{
    this.setState({emojiPicker:!this.state.emojiPicker})
  }


  render(){
    const {errors,message,loading,modal,uploadState,percentUpload,emojiPicker} = this.state;
    return (
      <Segment className="message_form">
        {emojiPicker && (
          <Picker
            set='apple'
            onSelect={this.handleAddEmoji}
            className='emojipicker'
            title="Pick your emoji"
            emoji="point_up"/>
        )}
        <Input
        fluid
        name="message"
        ref={node=>(this.messageInputRef=node)}
        value = {message}
        style={{marginBottom:'0.7em'}}
        label = {<Button icon={emojiPicker?'close':'add'} content=  {emojiPicker?'Close':null} onClick={this.handleToggle}/>}
        labelPosition="left"
        onChange = {this.changeHandler}
        onKeyDown={this.handleKeyDown}
        className={errors.length>0?'error': ''}
        placeholder="write your messages"/>


      <Button.Group icon width="2">
        <Button
        color="orange"
        content="Add Reply"
        disable={loading.toString()}
        labelPosition="left"
        onClick={this.sendMessage}
        icon="edit"
        />
        <Button
          color="teal"
          disabled = {uploadState ==='uploading'}
          onClick={this.openModal}
          content="upload Media"
          labelPosition = "right"
          icon="cloud upload"
        />
        <FileModal
          modal = {modal}
          closeModal= {this.closeModal}
          uploadFile = {this.uploadFile}/>
        </Button.Group>
        <ProgressBar
          uploadState= {uploadState}
          percentUpload={percentUpload}
        />
        </Segment>
    )
  }
}

export default MessageForm;
