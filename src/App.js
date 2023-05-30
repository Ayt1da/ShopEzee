import './App.css';
import AIChatBot from './llm';
import { useEffect, useRef, useState } from "react";

function App() {
  const [Review, setReview] = useState();
  const [Details, setDetails] = useState('');
  const review = () => {
    console.log('reviewing');
    window.chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
      var activeTab = tabs[0];
      var activeTabId = activeTab.id;

      return  window.chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          // injectImmediately: true,  // uncomment this to make it execute straight away, other wise it will wait for document_idle
          func: DOMtoString,
          args: ['body']  // you can use this to target what element to get the html for
      });
    }).then(function (results) {
        console.log(results[0].result);
        let html = results[0].result;
        setReview(JSON.stringify(extractTitle(html))+JSON.stringify(extractDesc(html))+JSON.stringify(extractRating(html)).slice(0, 4000));
        setDetails(JSON.stringify(extractDetails1(html))+JSON.stringify(extractDetails2(html)));
      }).catch(function (error) {
        console.log(error)
    });
  }

  function DOMtoString(selector) {
    if (selector) {
        selector = document.querySelector(selector);
        if (!selector) return "ERROR: querySelector failed to find node"
    } else {
        selector = document.documentElement;
    }
    return selector.outerHTML;
  }
  
  function extractTitle(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var reviews = [];
    
    var reviewAnchors = doc.querySelectorAll('a.Review-title-content');
    
    reviewAnchors.forEach(function (anchor) {
      var span = anchor.querySelector('span');
      if (span) {
        reviews.push(span.innerHTML.trim());
      }
    });
    
    return reviews;
  }
  
  function extractDesc(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var reviews = [];
    
    var reviewAnchors = doc.querySelectorAll('div.Review-text-content');
    
    reviewAnchors.forEach(function (anchor) {
      var span = anchor.querySelector('span');
      if (span) {
        reviews.push(span.innerHTML.trim());
      }
    });
    
    return reviews;
  }
  
  function extractRating(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var reviews = [];
    
    var reviewAnchors = doc.querySelectorAll('i.Review-rating');
    
    reviewAnchors.forEach(function (anchor) {
      var span = anchor.querySelector('span');
      if (span) {
        reviews.push(span.innerHTML.trim());
      }
    });
    return reviews;
  }
  function extractDetails1(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var details = {};
    
    var rows = doc.querySelectorAll('table#productDetails_techSpec_section_1 tbody tr');
  
    rows.forEach(function (row) {
      var th = row.querySelector('th');
      var td = row.querySelector('td');
      if (th && td) {
        var key = th.textContent.trim();
        var value = td.textContent.trim();
        details[key] = value;
      }
    });
  
    return details;
  }

  function extractDetails2(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var details = {};
    
    var rows = doc.querySelectorAll('table#productDetails_detailBullets_sections1 tbody tr');
  
    rows.forEach(function (row) {
      var th = row.querySelector('th');
      var td = row.querySelector('td');
      if (th && td) {
        var key = th.textContent.trim();
        var value = td.textContent.trim();
        details[key] = value;
      }
    });
  
    return details;
  }

  return (
    <div className="App flex flex-col w-[48rem] justify-center items-center bg-gray-900 h-full text-white max-h-[35rem]">
      <h1 className='m-4 text-2xl font-semibold'>ShopEzee</h1>
      {!Review && <button onClick={() => review()} class='btn text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 m-4 p-2 rounded-sm drop-shadow'>Review Product</button>}
      {Review && <AIChatBot review={Review} details={Details} />}
    </div>
  );
}

export default App;
