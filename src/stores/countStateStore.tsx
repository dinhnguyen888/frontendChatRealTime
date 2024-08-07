
import { create } from 'zustand';

export interface Room {
  id: string;
  name: string;
  avatar?: string;

}

export interface ChatAppState {
  reload: number;
  status: boolean;
  room: Room;
  setRoomData: (room:Room) => void;
  friendRoomClicked: boolean;
  triggerReload: () => void;
  checkStatus:() => void;
  roomClick:string;
  getRoomClicked: () => string;
  setRoomClicked:(roomClick:string) => void;
  clickFriendRoom: (state:boolean ) => void;
}

export const useChatAppStore = create<ChatAppState>((set,get) => ({
  reload: 0,
  status: false,
  roomClick:'',
  room: {id:'', name:''},
  friendRoomClicked: false,
  setRoomData: (room:Room) => set({room}),
  getRoomClicked: () => get().roomClick,
  setRoomClicked: (roomClick) => set({roomClick}),
  triggerReload: () => set((state:ChatAppState) => ({reload: state.reload + 1})), //handle chatbox component reload
  checkStatus: () => set({ status: !get().status }),
  clickFriendRoom: (state) => set({friendRoomClicked : state})
}));
