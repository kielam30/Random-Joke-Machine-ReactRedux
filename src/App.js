
import './App.css';
import React, { Component } from 'react';
import thunk from 'redux-thunk';
import ReactDOM from 'react-dom';
import { Provider, connect } from "react-redux";
import { createStore, applyMiddleware } from "redux";


const getRandomNum = max => Math.floor(Math.random()*max);
const getColor = () => {

    let r = getRandomNum(128);
    let g = getRandomNum(128);
    let b = getRandomNum(128);

    return [r,g,b]
}
const convertToHex = val => {
    let hex = val.toString(16);
    return  hex.length === 1 ? "0" + hex : hex;
}
const rgbToHex = rgb => {
    return "#" + convertToHex(rgb[0]) + convertToHex(rgb[1]) + convertToHex(rgb[2]);
}

//Redux
//action
const GET_QUOTE = "GET_QUOTE";
const NEW_QUOTE = "NEW_QUOTE";
const LOAD = "LOAD";

const getQuote = () => dispatch => {
    dispatch({type: LOAD});
    fetch("https://raw.githubusercontent.com/15Dkatz/official_joke_api/master/jokes/index.json")
        .then(res => res.json())
        .then(data => dispatch({type: GET_QUOTE, list: data}));
}; //handle async 

const newQuote = (quoteIdx, color) => {
    return {
        type: NEW_QUOTE,
        quoteIdx: quoteIdx,
        color: color
    };
};

//reducer
const quoteReducer = (state = defaultState, action) => {
    switch (action.type) {
        case LOAD:
            return {
                ...state,
                load: true
            };
        case GET_QUOTE: 
        const quoteIdx = getRandomNum(action.list.length);
            return {
                ...state,
                color: state.color,
                load: false,
                list: action.list,
                curr: action.list[quoteIdx]
            };
        case NEW_QUOTE: 
            return {
                ...state,
                color: action.color,
                curr: state.list[action.quoteIdx]
            };
            default:
                return state;
        }
    };

//store
const defaultState = {
    color: rgbToHex(getColor()),
    load: false,
    list: [],
    curr: {setup:"", punchline:""}
};

const store = createStore(quoteReducer, applyMiddleware(thunk)); //handle async

//React 
//app
function App() {
    return (
        <Provider store={store}>
            <QuoteMachineApp />
        </Provider>
    );
}

//quote
const Quote = ({setup = "...", punchline = ""}) => {
    return (
        <div className="quote">
            <div id="setup">{setup}</div>
            <div id="punchline">{punchline}</div>
        </div>
    );
};

//machine
class QuoteMachine extends React.Component {
    componentDidMount() {
        this.props.getQuote();
    }

    getNewQuote = () => {
        const quoteIdx = getRandomNum(this.props.list.length);
        const color = rgbToHex(getColor());
        this.props.newQuote(quoteIdx, color);
    };

    render () {
        const {curr, load, color} = this.props;
        return (
          <div className="container" style={{backgroundColor: color, color: color}}>
            <h1>Random Gag Machine</h1>
            <div className="quote-machine">
              <div id="quote-box" className="quote-box">
                {load ? ( <Quote />) :
                (<Quote setup={curr.setup} punchline={curr.punchline} />)
                }
                <div className="quote-footer">
                  <a href="twitter.com/intent/tweet" id="tweet-quote" className="button" target="_blank" style={{backgroundColor: color}}>
                  <i className= "fab fa-twitter" /> Tweet
                  </a>
                  <button id="new-quote" className="button" onClick={this.getNewQuote} style={{backgroundColor: color}} >
                    Next</button>
                </div>
              </div>
            </div>
            <p>By Jackie Lam - 6 Jul 2021</p>
          </div>
        );
    }
}

//react-redux
const mapStateToProps = state => {
  return {
    color: state.color,
    load: state.load,
    list: state.list,
    curr: state.curr
  };
};

const mapDispatchToProps = dispatch => {
  return {
  getQuote: ()  => dispatch(getQuote()),
  newQuote: (quoteIdx, color) => dispatch(newQuote(quoteIdx, color))
  }
};

const QuoteMachineApp = connect(mapStateToProps, mapDispatchToProps)(QuoteMachine);

ReactDOM.render(App, document.getElementById("root")); //render

export default App;
