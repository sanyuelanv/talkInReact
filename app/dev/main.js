'use strict'
import 'babel-polyfill'
import React from 'react'
import {render} from 'react-dom'
import App from './app'

let main = function(){
	render(<App />,document.getElementById('main'))
}
window.onload = function(){
	main()
}
