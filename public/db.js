const mongoose = require("mongoose");
// let db;
// const request = indexedDB.open("budget", 3);

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

const request = window.indexedDB.open("expense-data", 3);


request.onupgradeneeded = ({target}) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true});
};

request.onsuccess = ({target}) => {
    db = target.result;

    if (navigator.onLine) {
        saveRecord();
        checkDatabase();
        
    }
};

request.onerror = function(evt) {
    console.log("Whoops! ", + evt.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readWrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readWrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json" 
                }
            }).then(response => {
                return response.json();
            }).then(() => {
                const transaction = db.transaction(["pending"], "readWrite");
                const store = transaction.ObjectStore("pending");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", checkDatabase);