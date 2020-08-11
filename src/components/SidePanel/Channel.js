import React from 'react';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../Action';
import firebase from '../Firebase';
import {Menu,Icon,Modal,Input,Form,Button,Label} from 'semantic-ui-react';

class Channels extends React.Component{
    state = {
      user:this.props.currentUser,
      channel:null,
      channels:[],
      channelName:'',
      channelDetails:'',
      channelsRef:firebase.database().ref('channels'),
      messagesRef:firebase.database().ref('messages'),
      typingRef:firebase.database().ref('typing'),
      notifications:[],
      modal:false,
      firstload: true,
      activechannel:'',
    }

    componentDidMount(){
        console.log('didmount')
        this.listenToEvent()
    }

    componentWillUnmount(){
      this.removeListeners()
    }

    removeListeners = () =>{
      this.state.channelsRef.off();
      this.state.channels.forEach(channel =>{
        this.state.messagesRef.child(channel.id).off();
      })
    }

    listenToEvent = () =>{
      let channel = []
      this.state.channelsRef.on('child_added', snap =>{
        channel.push(snap.val())
        this.setState({channels:channel}, ()=>this.setFirstChannel());
        this.addNotificationListener(snap.key)
      })
    }

    addNotificationListener = channelId =>{
      this.state.messagesRef.child(channelId).on('value',snap=>{
        if(this.state.channel){
          this.handleNotifications(channelId,this.state.channel.id,this.state.notifications,snap);
        }
      })
    }

    handleNotifications = (channelId,currentChannelId,notifications,snap) =>{
      let lastTotal = 0;
      let index =  notifications.findIndex(notification =>notification.id === channelId);

      if(index !== -1){
          if(channelId !== currentChannelId){
            lastTotal = notifications[index].total;
            if(snap.numChildren() - lastTotal> 0){
              notifications[index].count = snap.numChildren() - lastTotal
            }
          }
          notifications[index].lastKnownTotal = snap.numChildren();
      }else{
        notifications.push({
          id:channelId,
          total:snap.numChildren(),
          lastKnownTotal:snap.numChildren(),
          count: 0
        })
      }
      this.setState({notifications});
    }

    setFirstChannel = () =>{
        if(this.state.firstload && this.state.channels.length > 0){

            const firstchannel = this.state.channels[0]
            this.props.setCurrentChannel(firstchannel)
            this.setState({firstload:false,activechannel:firstchannel.name,channel:firstchannel})
        }

    }
    changeChannel= channel =>{
        this.props.setCurrentChannel(channel);
        this.state.typingRef
        .child(this.state.channel.id)
        .child(this.state.user.uid)
        .remove();
        this.clearNotifications();
        this.props.setPrivateChannel(false)
        this.setState({activechannel:channel.name,channel:channel})

    }

    clearNotifications = () =>{
      let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);


    if(index !==-1){
      let updatedNotifications = [...this.state.notifications]
      updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({notifications:updatedNotifications});
    }}

    addChannel = () => {
      const{channelsRef,channelName,channelDetails,user} = this.state;

      const key = channelsRef.push().key;

      const newChannel = {
            id:key,
            name:channelName,
            details:channelDetails,
            createdby:{
                user: user.displayName
            }
      }

      channelsRef
      .child(key)
      .update(newChannel)
      .then(()=>{
          this.setState({channelName:'',channelDetails:''});
          this.closeModal();
      })
      .catch(err =>{
          console.log(err)
      })
    }


    formvalid = ({channelName,channelDetails}) => channelName && channelDetails

    submitHandle = event =>{
        if(this.formvalid(this.state)){
            this.addChannel()
        }
    }


    closeModal = () => this.setState({modal:false})

    openModal = () => this.setState({modal:true})

    changeHandler = event =>{
        this.setState({[event.target.name]:event.target.value});
    }

    getNotificationCount = channel => {
      let count=0
      this.state.notifications.forEach(notification =>{
        if(notification.id===channel.id){
            count = notification.count;
        }
      });
        if(count>0)return count;
    }

    displayChannel= channels =>(

        channels.length > 0 && channels.map(channel=>
          (
            <Menu.Item
            key = {channel.id}
            onClick = {() =>this.changeChannel(channel)}
            name={channel.name}
            style={{color:'white',opacity:0.7,cursor:'pointer'}}
            active={this.state.activechannel===channel.name?true:false}>
            {this.getNotificationCount(channel) && (
              <Label color="red">{this.getNotificationCount(channel)}</Label>
            )}
            #{channel.name}
          </Menu.Item>
        ))
      )


    render(){
        const {channels,modal} = this.state
        return(
          <React.Fragment>
          <Menu.Menu className="menu" >
          <Menu.Item style={{color:'white'}}>
              <span>
                  <Icon name="exchange"/> CHANNELS {' '}
              </span>
          ({channels.length})<Icon name='add' style={{cursor:'pointer'}}onClick={this.openModal}/>
          </Menu.Item>
          {this.displayChannel(channels)}
          </Menu.Menu>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Add a Channel</Modal.Header>
            <Modal.Content>
              <Form>
              <Form.Field>
                <Input
                  fluid
                  label = "Name of the channel"
                  name = "channelName"
                  onChange = {this.changeHandler}/>
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label = "About channel"
                  name = "channelDetails"
                  onChange = {this.changeHandler}/>
              </Form.Field>
              </Form>
              <Modal.Actions style={{paddingTop:'2em',marginLeft:'74%'}}>
                    <Button color='green' inverted onClick={this.submitHandle}>
                        <Icon name="checkmark"/>add
                    </Button>
                    <Button color='red' inverted onClick={this.closeModal}>
                        <Icon name="remove"/ > Cancel
                    </Button>
              </Modal.Actions>
              </Modal.Content>
          </Modal>
          </React.Fragment>
        );
    }
}


export default connect(null,{setCurrentChannel,setPrivateChannel})(Channels)
