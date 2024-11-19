import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  username: string | null;
  email: string | null;
  password: string | null;
  role: string | null;
}

const initialState: UserState = {
  username: null,
  email: null,
  password: null,
  role: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.role = action.payload.role;
    },
    logoutUser: (state) => {
      state.username = null;
      state.email = null;
      state.password = null;
      state.role = null;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
