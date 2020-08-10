import React from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessagesForm from './MessageForm';
import Message from './Message';
import firebase from '../Firebase';
import {connect} from 'react-redux';
import {setUserPosts} from '../Action';
import Typing from './Typing';
import Skeleton from './Skeleton';

class Messages extends React.Component{
    state = {
      privateMessagesRef:firebase.database().ref('privateMessages'),
      privateChannel:this.props.isPrivateChannel,
      messagesRef: firebase.database().ref('messages'),
      usersRef:firebase.database().ref('users'),
      channel:this.props.currentChannel,
      isChannelStarred:false,
      user:this.props.currentUser,
      messages:[],
      messagesLoading:false,
      progressBar:false,
      numUniqueUsers:'',
      searchTerm:'',
      searchLoading:false,
      searchResults:[],
      typingRef:firebase.database().ref('typing'),
      typingUsers:'',
      connectedRef:firebase.database().ref('.info/connected'),
      listeners:[]
    }
    componentDidMount(){
      const {channel,user, listeners}=this.state

      if(channel && user){
        this.removeListeners(listeners)
        this.addListener(channel.id);
        this.addUserStarsListener(channel.id,user.uid)
      }
    }

    componentWillUnmount(){
      this.state.connectedRef.off();
      this.removeListeners(this.state.listeners);
    }

    removeListeners = listeners => {
      listeners.forEach(listener =>{
        listener.ref.child(listener.id).off(listener.event)
      });
    }

    componentDidUpdate({prevProps,prevState}){
        if(this.messagesEnd){
          this.scrollToBottom();
        }
    }

    addToListeners = (id,ref,event) =>{
        const index= this.state.listeners.findIndex(listener =>{
          return listener.id === id && listener.ref ===ref && listener.event ===
          event;
        })
        if(index === -1){
          const newListener = {id,ref,event};
          this.setState({listeners:this.state.listeners.concat(newListener)})
        }
    }

    addUserStarsListener = (channelId,userId) =>{
        this.state.usersRef
        .child(userId)
        .child('starred')
        .once('value')
        .then(data =>{
          if(data.val() !==null){
            console.log("object keys", Object.keys(data.val()))
            const channelIds = Object.keys(data.val())
            const prevStarred = channelIds.includes(channelId)
            this.setState({isChannelStarred:prevStarred})
          }
        })
    }

    handleStar = () =>{
      this.setState(prevState =>({
        isChannelStarred: !prevState.isChannelStarred
      }),() => this.starChannel())
    }


    starChannel = () =>{

      if(this.state.isChannelStarred){
        this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .update({
          [this.state.channel.id]:{
              name:this.state.channel.name,
              details:this.state.channel.details,
              createdBy:{
                name:this.state.channel.createdby.user
              }
          }
        })
      }
      else{
        this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err =>{
          if(err !==null){
            console.log(err)
          }
        })
      }
    }

    addListener = id =>{
        this.setState({messagesLoading:true})
        this.addMessageListener(id)
        this.addTypingListener(id)

    }

    addTypingListener = id =>{
      let typingUsers = [];
      this.state.typingRef.child(id).on('child_added',snap =>{
        if(snap.key !== this.state.user.uid){
          typingUsers = typingUsers.concat({
            id:snap.key,
            name:snap.val()
          })
          this.setState({typingUsers});
        }
      });
      this.addToListeners(id, this.state.typingRef, 'child_added')

      this.state.typingRef.child(id).on('child_removed',snap =>{
        const index = typingUsers.findIndex(user => user.id === snap.key);
        if(index!==-1){
          typingUsers = typingUsers.filter(user => user.id !== snap.key);
          this.setState({typingUsers});
        }
      })
      this.addToListeners(id, this.state.typingRef, 'child_removed')
      this.state.connectedRef.on('value',snap =>{
        if(snap.val() ===true){
          this.state.typingRef
          .child(id)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove(err=>{
            if(err !==null){
              console.error(err);
            }
          })
        }
      })
    }


    getMessagesRef = () =>{
    const {messagesRef,privateMessagesRef,privateChannel} = this.state;
    return privateChannel ? privateMessagesRef: messagesRef
  }

    addMessageListener = id =>{
      let loadedMessages = []
      const ref = this.getMessagesRef()
      console.log("entered snap",ref.child(id).once('value').then(snap =>{if(snap.val()==null){
        this.setState({messagesLoading:false})
      }}))
      ref.child(id).on('child_added',snap =>{
          loadedMessages.push(snap.val())
          this.setState({
            messages:loadedMessages,
            messagesLoading:false
          });
          this.countUniqueUsers(loadedMessages);
          this.countUserPosts(loadedMessages);
      });
      this.addToListeners(id, ref, 'child_added')
    }

    countUserPosts= messages =>{
      let userPosts = messages.reduce((acc,message)=>{
        if(message.user.name in acc){
          acc[message.user.name].count += 1
        }
        else{
          acc[message.user.name]={
            count : 1
          }
        }
          return acc
        },{})
        this.props.setUserPosts(userPosts)
      }



    countUniqueUsers = messages =>
    {
      const uniqueUsers = messages.reduce((acc,message)=>{
          if(!acc.includes(message.user.name)){
            acc.push(message.user.name)
          }
          return acc;
      },[])

    console.log()
    const numUniqueUsers  =  uniqueUsers.length === 1 ? `${uniqueUsers.length} user`:`${uniqueUsers.length} users`;
    this.setState({numUniqueUsers})
    }

    handleSearchChange = event =>{
       this.setState({
          searchTerm: event.target.value,
          searchLoading:true
       },() =>this.handleSearchMessages())
    }

    handleSearchMessages = () =>{
      const channelMessages = [...this.state.messages]
      const regex = new RegExp(this.state.searchTerm,'gi')
      const searchResults =  channelMessages.reduce((acc,message)=>{
        if((message.content && message.content.match(regex)) || message.user.name.match(regex)){
          acc.push(message)
        }
        return acc;
      },[])
      this.setState({ searchResults});
      setTimeout(()=> this.setState({searchLoading:false}),200)
    }

    displayMessages = (messages,loading) =>(
       messages.length ?messages.map(message =>(
          <Message
            key={message.timestamp}
            message = {message}
            user = {this.state.user}/>
        )):loading?null:this.blank()
      )

    blank  = ()=>(
        <span style={{fontStyle:"italic",opacity:'0.7'}}>No messages </span>
    )


    isProgresBarVisible = percent =>{
        if (percent > 0){
             this.setState({progressBar:true});

        }
        if (percent === 100){
             this.setState({progressBar:false});

        }
    }

    displayChannelName = channel =>{
        return channel ? `${this.state.privateChannel? '@':'#'}${channel.name}`:
        '';
    }

    displayTypingUsers = users =>(
      users.length > 0 && users.map(user =>(
        <div style={{display:'flex',alignItems:'center', marginBottom:"0.2em"}} key={user.id}>
        <span className="user__typing">{user.name} is typing</span>
        <Typing/>
        </div>
      ))
    )

    displayMessagesSkeleton = loading =>(
      loading?(
      <React.Fragment>
       {[...Array(10)].map((_,i)=>(
         <Skeleton key={i}/>
       ))}
      </React.Fragment>
    ):null
    )

    scrollToBottom = () =>{
      this.messagesEnd.scrollIntoView({behaviour:'smooth'});
    }

    render(){
      const {messagesRef,messages, messagesLoading,channel, user, progressBar, numUniqueUsers,
         searchTerm, searchResults, searchLoading, privateChannel, isChannelStarred,
       typingUsers} = this.state
      return(
          <React.Fragment>
            <MessagesHeader
              searchLoading={searchLoading}
              channelName={this.displayChannelName(channel)}
              numUniqueUsers = {numUniqueUsers}
              handleSearchChange = {this.handleSearchChange}
              isPrivateChannel={privateChannel}
              handleStar = {this.handleStar}
              isChannelStarred = {isChannelStarred}

            />

          <Segment className="message_segment">
              <Comment.Group className={progressBar?'messages__progress':'messages'}>
                {this.displayMessagesSkeleton(messagesLoading)}
                {searchTerm ? this.displayMessages(searchResults): this.displayMessages(messages,messagesLoading)}
                {this.displayTypingUsers(typingUsers)}
                <div ref = {node => (this.messagesEnd=node)}/>
              </Comment.Group>
          </Segment>
          <MessagesForm
          user = {user}
          channel = {channel}
          messagesRef={messagesRef}
          isProgresBarVisible={this.isProgresBarVisible}
          isPrivateChannel={privateChannel}
          getMessagesRef = {this.getMessagesRef}
          />
              </React.Fragment>

      )
    }
}

export default connect(null,{setUserPosts})(Messages);
