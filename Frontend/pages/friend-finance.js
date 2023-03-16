import React from "react";
import { useState, useEffect } from 'react';
import { Header } from "components/Header";
import { SearchBar } from "components/SearchBar";
import { IncomeExpenses } from "components/IncomeExpenses";
import { History } from "components/History";

// import { TransactionList } from 'components/TransactionList';
import { AddRequest } from "../components/AddRequest";
import { AddTransaction } from "../components/AddTransaction";
import Navbar from "../components/Navbar";

import { GlobalProvider } from "context/GlobalState";
import { PendingListDisplay } from "@/components/PendingListDisplay";

//import 'pages/App.css';

function App() {
  const [friendHistory, setFriendHistory] = useState([])    
  const [PendingList, setPendingList] = useState([])    
  const fetchUserData = () => {
    fetch('http://localhost:1337/api/getFriendsHistory', {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('token'),
        }
    }).then(res => {
      return res.json()
    }).then(data => {
      setFriendHistory(data.friendsHistory.reverse())
      setPendingList(data.requests.reverse());
      console.log(data.requests);
    })
  }
  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <GlobalProvider>
      <Navbar></Navbar>

      <main className="flex flex-col flex-1 text-center m-5">
        <div className="flex">
          <div className="w-1/3 flex flex-col p-7 m-5 mx-auto rounded-2xl shadow-2xl h-screen">
            {/* <Balance/> */}
            {/* <IncomeExpenses/> */}
            <SearchBar />
            {/* <PendingListDisplay /> */}
            <h3
              className="text-2xl font-bold text-gray-500 m-2 mt-10"
              style={{ borderBottom: "thick solid gray" }}
            >
              Pending Requests
            </h3>
            <div className="item-center m-2 p-3 overflow-auto max-h-64">
              <ul className="list flex flex-col justify-center item-center">
                {PendingList.map((request) => {
                  return (
                    <div
                      className="users flex items-center p-1 text-white w-100 m-1 min-w-0"
                      style={{
                        backgroundColor: "rgb(88, 151, 252)",
                        borderRadius: "15px",
                      }}
                    >
                      <p className="justify-start w-60 items-center">
                        {" "}
                        {request.senderName} ({request.senderEmail}) Requested Rs.{request.amount}{" "}
                      </p>
                      <div className="text-right">
                        <button class="rounded-full w-15 py-0.5 px-3 m-1  bg-green-600 ">
                          {" "}
                          Accept{" "}
                        </button>
                        <button class="rounded-full w-15 py-0.5 px-2 m-1 bg-red-600">
                          Decline
                        </button>
                      </div>
                      {/* <p> {user.Amount}</p>
                      <p> {user.Description}</p> */}
                    </div>
                  );
                })}
              </ul>
            </div>
          </div>
          <div className="w-1/3 flex flex-col p-7 m-5 rounded-2xl shadow-2xl h-screen">
            <AddTransaction />
            <AddRequest />
          </div>
          <div className="w-1/3 flex p-7 m-5 mx-auto justify-center rounded-2xl shadow-2xl h-screen">
            {/* <History /> */}
            <div className="App">
              <h3
                className="text-2xl font-bold text-gray-500 m-2"
                style={{ borderBottom: "thick solid gray" }}
              >
                History
              </h3>
              {/* Iterate over imported array in userData */}
              <div className="users overflow-auto h-3/4 w-96">
                {friendHistory.map((user) => {
                  if (user.amount < 0) {
                    return (
                      <div className="px-5 py-2 m-3 border-r-4 border-b-4 border-t-2 border-l-2 border-red-600 rounded-lg">
                        <p>
                          {" "}
                          You paid {user.friendName} ({user.friendEmail}) ₹ {-user.amount}
                        </p>
                        {/* <p> ₹ {user.Amount}</p>
                      <p> {user.Description}</p> */}
                      </div>
                    );
                  } else {
                    return (
                      <div className="px-5 py-2 m-3 border-r-4 border-b-4 border-t-2 border-l-2 border-green-600 rounded-lg ">
                        <p>
                          {" "}
                          {user.friendName} ({user.friendEmail}) paid you ₹ {user.amount}
                        </p>
                        {/* <p> ₹ {user.Amount}</p>
                      <p> {user.Description}</p> */}
                      </div>
                    );
                  }
                })}
                {/* Display each data in array in a card */}
                {/* Each card must have a 'key' attribute */}
              </div>
            </div>
            {/* <ul>
            {friendHistory.map(transaction => {
              <li key={transaction.friend}>{transaction.friend} {transaction.amount}</li>
            })}
            </ul> */}
          </div>
        </div>
      </main>
    </GlobalProvider>
  );
}

export default App;