import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/app/utils/axios"
import { error } from "console";

const profileSlice = createSlice({
    name:'profile',
    initialState:{
        profile :null as any | null,
        loading:false ,
        error:null  as string | null,
    }
    ,
    reducers:{},
    extraReducers:{
        
    }
})
