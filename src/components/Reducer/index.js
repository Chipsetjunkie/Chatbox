import * as actiontypes from "../Action/type";
import {combineReducers} from 'redux';

const initialUserState= {
    currentUser:null,
    isLoading:true
};


const user_reducer = (state= initialUserState,action) =>{
    switch(action.type){
      case actiontypes.SET_USER:
        return{
          currentUser:action.payload.currentUser,
          isLoading:false
        }

      case actiontypes.CLEAR_USER:
        return{
            ...initialUserState,
            isLoading:false
        }
      default:
          return state
    }

}

const initialChannelState= {
    currentChannel:null,
    isPrivateChannel:false,
    userPosts:null
};



const channel_reducer = (state=initialChannelState,action) =>{
    switch (action.type) {
      case actiontypes.CHANNEL_USER:
          return{
            ...state,
            currentChannel:action.payload.currentChannel
          }

      case actiontypes.SET_PRIVATE_CHANNEL:
            return{
              ...state,
              isPrivateChannel:action.payload.isPrivateChannel
            }

      case actiontypes.SET_USER_POSTS:
          return{
            ...state,
            userPosts:action.payload.userPosts
          }

      default:
        return state
    }
}

const initialColorState = {
  primaryColor:'#4c3c4c',
  secondaryColor:'#eee'
}

const colors_reducer = (state = initialColorState,action)=>{
  switch (action.type) {
    case actiontypes.SET_COLORS:
      return{
        primaryColor:action.payload.primary,
        secondaryColor:action.payload.secondary
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
    user:user_reducer,
    channel:channel_reducer,
    colors:colors_reducer
});

export default rootReducer;
