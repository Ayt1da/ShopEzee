import './App.css';
import { useEffect, useRef, useState } from "react";
import useLLM, { OpenAIMessage } from "usellm";

export default function AIChatBot(props) {
  const [status, setStatus] = useState("idle");
  const [content, setContent] = useState(
    `   only for the fist user promt use this review summerizer setting:
    You are a product review assistant for a customer 
    You analyze the data given to you from the user 
    You analyze rating of the product , review title of the product and the past purchase reviews of the product 
    
    You answer the customer by 
    in the following format 
    
    Summary: 
    3 line Product summary of the product 
    Rating :
    Overall rating of the product with star emoji's with number of total starts 
    pros 
    3 Pros  of the product start with hyphen 
    cons 
    3 Cons of the product start with hyphen 
    
    Customer Feeling :
    Do the reviews sentimental analyses tell whether the customer is happy or not within 6 words with a emoji.

    
    after the first user prompt, change into a product review assistant for a customer
    You analyze the data given to you from the user 
    You analyze rating of the product , review title of the product and the past purchase reviews of the product 

    You answer the customer by 
    in the following format 

    text inside the square bracket is product description 
    the product data is given by 
    [${props.details}]

    Analyze the product description 

    answer when the user initiates a question or starts a question 
    The customer asks question to you 
    and you answer to the customer questions 
    The text given by the user is related to the product description or the product summary 
    Do not prompt about the ai Model 

    Here the word "you" means the product 

    `);
  const [history, setHistory] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Review Pilot, your personal review assistant.'"
    },
    {
      role: "system",
      content: content,
    },
  ]);
  const [inputText, setInputText] = useState(props.review);

  const llm = useLLM({
    serviceUrl: "https://usellm.org/api/llm", // Replace with your own service URL
  });

  let messagesWindow = useRef(null);

  useEffect(() => {
    console.log("runs");
    handleSend();
  }, [props.review]);

  useEffect(() => {
    if (messagesWindow.current) {
      messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
    }
  }, [history]);

  async function handleSend() {
    if (!inputText) {
      return;
    }
    try {
      setStatus("streaming");
      const newHistory = [...history, { role: "user", content: inputText }];
      setHistory(newHistory);
      setInputText("");
      const { message } = await llm.chat({
        messages: newHistory,
        stream: true,
        onStream: ({ message }) => setHistory([...newHistory, message]),
      });
      setHistory([...newHistory, message]);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-y-hidden">
      <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 w-full drop-shadow"></div>
      <div
        className="w-full flex-1 overflow-y-auto px-4"
        ref={(el) => (messagesWindow.current = el)}
      >
        {history.map((message, idx) => (
          <Message {...message} key={idx} />
        ))}
      </div>
      <div className="w-full pb-4 flex px-4">
        <input
          className="p-2 border rounded w-full block dark:bg-gray-900 dark:text-white drop-shadow"
          type="text"
          placeholder={getInputPlaceholder(status)}
          value={inputText}
          disabled={status !== "idle"}
          autoFocus
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="p-2 border rounded hover:bg-purple-400 font-medium ml-2"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const Square = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  </svg>
);

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

function getInputPlaceholder(status) {
  switch (status) {
    case "idle":
      return "Ask me anything about the product...";
    case "streaming":
      return "Wait for my response...";
    default:
      return "";
  }
}

function Message({ role, content }) {
  return (
    <div className="my-4">
      <div className="font-semibold text-gray-800 dark:text-white">
        {capitalize(role)}
      </div>
      <div className="text-gray-600 dark:text-gray-200 whitespace-pre-wrap mt-1">
        {content}
      </div>
    </div>
  );
}