/*

author: Carlo O. Dominguez

*/

let messagesEl = document.querySelector('.messages');
let peerIdEl = document.querySelector('#connect_to_peer');

let conn = null;
let oData = {}, doctorID = ""
       

const zonked = {

   
    /* ===THIS GOES TO UTIL.JS UNDER LOGINPOST()====
    socket: io.connect("https://osndp.onrender.com", {
        withCredentials: true,
        extraHeaders: {
          "osndp-header": "osndp"
        }
    }),
    */
    socket:null,   
    speaks: null,
    socketID: null,
    aExpert:[],
    
    //******  THIS  IS FOR VIDEO.JS */
    // Register with the peer server
    peer : null,
  
    logMessage : (message) => {
        let newMessage = document.createElement('div');
        newMessage.innerText = message;
        messagesEl.appendChild(newMessage);
    },

    renderVideo : (stream) => {
        const remoteVideo = document.getElementById('remote_video');
        remoteVideo.srcObject = stream;
        remoteVideo.play()
    },


    playVideoFromCamera : async () => {
        alert('playvideofromcam()')
        console.log('...playing local')
        try{

            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                devices.forEach(function (device) {
                alert(
                    device.kind + ": " + device.label + " id = " + device.deviceId
                );
                });
            });

            const constraints = {'video': true, 'audio': true};
            let xstream
            xstream = await navigator.mediaDevices.getUserMedia(constraints);

            const localVideo = document.getElementById('local_video');
            localVideo.srcObject = xstream;
            localVideo.play()

            //initiate connect if patient
            // if(util.getCookie('grp_id')=='1'){
            //     zonked.connectToPeer()
            // }
            
        } catch(error) {
            console.error('Error opening video camera.', error);
        }
    },

    // Initiate outgoing connection //DIALLER
    connectToPeer :() => {
        //let peerId = doctorID//orig peerIdEl.value;
        let peerId = document.getElementById('connect_to_peer').value;

        zonked.logMessage(`Connecting to ${peerId}...`);
        
        conn = zonked.peer.connect(peerId);
    
        conn.on('data', (data) => {
            conn.send('Patient connecting...');
            zonked.logMessage(`received: ${data}`);
        });
    
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then((stream) => {
            let call = zonked.peer.call(peerId, stream);
            call.on('stream', zonked.renderVideo);
        })
        .catch((err) => {
            logMessage('Failed to get local stream', err);
        });
      
    },//end function connectopeer()
  
    callDoctor: (drname,caseno) => {

        oData.doctor = drname
        oData.caseno = caseno
        oData.patient = util.getCookie('fname')

        zonked.socket.emit('dial', JSON.stringify(oData))
    },

    startVideo:(xname)=>{
        zonked.peer = new Peer( xname,{
            config: {
        
            iceServers: [
                   {
                    urls: "stun:stun.relay.metered.ca:80",
                  },
                  {
                    urls: "turn:global.relay.metered.ca:80",
                    username: "662d9229c6643efad5cff350",
                    credential: "olaC/gi/w2x2FllS",
                  },
                  {
                    urls: "turn:global.relay.metered.ca:80?transport=tcp",
                    username: "662d9229c6643efad5cff350",
                    credential: "olaC/gi/w2x2FllS",
                  },
                  {
                    urls: "turn:global.relay.metered.ca:443",
                    username: "662d9229c6643efad5cff350",
                    credential: "olaC/gi/w2x2FllS",
                  },
                  {
                    urls: "turns:global.relay.metered.ca:443?transport=tcp",
                    username: "662d9229c6643efad5cff350",
                    credential: "olaC/gi/w2x2FllS",
                  },
            ]
        
            } 
        })

        //util.modalShow('videomodal')
        //=== ON OPEN OF PEERJS ====
        zonked.peer.on('open', (id) => {

            console.log('called by startVideo , open(), ')
            
            zonked.logMessage('PEER ID: ' + id);
            
            //auto
            zonked.connectToPeer()


            //play local
            
        });
        messagesEl.innerHTML = ""
    
        zonked.peer.on('error', (error) => {
            zonked.logMessage(error);
        });
        
        // Handle incoming data connection from remote peer
        zonked.peer.on('connection', (conn) => {
    
            zonked.logMessage('Incoming Connection!');
    
            conn.on('open', () => {
                conn.send("Connected!")
                
                conn.on('data', (data) => {
                    //console.log('on data')
                    zonked.logMessage(`received: ${data}`);
                
                });
    
            });
    
            conn.on('close', () => {
                console.log('closing....')
                //===
                // manually close the peer connections
                for (let conns in zonked.peer.connections) {
                    zonked.peer.connections[conns].forEach((conn, index, array) => {
                    console.log(`closing ${conn.connectionId} peerConnection (${index + 1}/${array.length})`, conn.peerConnection);
                    conn.peerConnection.close();
    
                    // close it using peerjs methods
                    if (conn.close)
                        conn.close();
                    });
                }
                //==
            })
        });
    
        // Handle incoming voice/video connection //DIALER
        zonked.peer.on('call', (call) => {
            console.log('zonked.peeer.on.call triggered by???')
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
                .then((stream) => {
                    call.answer(stream); // Answer the call with an A/V stream.
                    call.on('stream', zonked.renderVideo);
            })
            .catch((err) => {
                console.error('Failed to get local stream', err);
            });
        });
    
        
    },
  
    /***** END VIDEOJS ******* */

    //approve for v3rification doctor list
    approve:async(xname,xemail)=>{
        console.log('firing approve()====')
        fetch(`https://osndp.onrender.com/approve/${xname}/${xemail}`)
        .then((response) => {  //promise... then
            return response.json();
        })
        .then((data) => {
            util.speak(data.voice)
            
            //clear dashboard again
            zonked.getapprovalReg()

            //for online zonked.speaks(data.voice)
        })
        .catch((error) => {
            console.error('Error:', error)
        })
    },

    //get all for approval
    getapprovalReg: async()=>{
        console.log('fired===getapprovalReg()')
        fetch(`https://osndp.onrender.com/getapprovalreg`)
        .then((response) => {  //promise... then
            return response.text();
        })
        .then((text) => {
            const txt = `
            <div class="container-fluid mt-0" id="current_projects"><br><br>
                <div class="mt-0 mb-10" style="border-radius:10px;background-color:white">
                <br> 
                    <div class="mbr-section-head" id="xhead">
                        <h3 class="mbr-section-title mbr-fonts-style align-center  display-2">
                            <strong>Admin Dashboard</strong>
                        </h3>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <p id='p-notif' class="mb-0"> </p>
                            <div class="row align-center">
                                <div class="container-fluid">
                                    <div class="mbr-section-head"><br><br>
                                        <b>List of Doctors for Verification</b>                    
                                    </div>
                                    <div>
                                        ${text}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br>
                </div>
            </div><br>`
            
            document.getElementById('dashboard').innerHTML = txt
            util.scrollsTo('dashboard')
        })
        .catch((error) => {
            console.error('Error:', error)
        })
    },

    insertHistory: async ()=>{//called by filterbyexpertise()  for patient history
        console.log('fired=== insertHisttory()==')
        fetch(`https://osndp.onrender.com/gethistory/${util.getCookie('f_userid')}`)
        .then((response) => {  //promise... then
            return response.text();
        })
        .then((text) => {
            const txt = `<div class="container-fluid">
                
                <div>${text}
                </div>`
            document.getElementById('history').innerHTML = txt
        })
        .catch((error) => {
            console.error('Error:', error)
        })
    }, 

    insertSection: async()=>{ // for patient,  get doctor
        console.log('fired==== insertSection()')
        let xtxt = `<!--//CURRENT PROJECTS//-->
        <div class="container-fluid mt-0" id="current_projects"><br><br>

           <div class="mbr-section-head" id="xhead">
                <h3 class="mbr-section-title mbr-fonts-style align-center  display-2">
                    <strong>Patient Dashboard</strong>
                </h3>
            </div>
            <div class="card">
                <div class="card-body">
                    <p id='p-notif' class="mb-0"> </p>
                    <div class="row align-center">
                        <div class="col-lg mb3">
                            <select style="margin-left:5px;margin-right:10px;"  class="form-control equipmentx mb-5" onchange ="javascript:zonked.filterBy(this.value)" id="expertise_type" name="expertise_type" >
                            </select>
                        </div>
                    </div>
                    <div class='row'>    
                        <div id="site_info"></div>
                    </div>
                    <div class='row'>
                        <div id='history'></div>
                    </div>
                </div>
            </div>
            <br>
        </div>`
    
        //append to main container section DASHBOARD
        document.getElementById('dashboard').innerHTML = xtxt
        zonked.filterExpertise('https://osndp.onrender.com/filterexpertise', document.getElementById('expertise_type'))
    },

    filterExpertise:(url,cSelect)=>{
        console.log('===filterExpertise()===')
        fetch(url)
        .then((response) => {  //promise... then
            return response.json();
        })
        .then((data) => {
            //console.log( 'webmall ',data )
           zonked.removeOptions( cSelect)
            /* TAKE OUT PLS SELECT VALUE*/
            let option = document.createElement("option")
            option.setAttribute('value', "")
            //option.setAttribute('selected','selected')
            let optionText = document.createTextNode( "-- Pls Select Expertise--" )
            option.appendChild(optionText)
            cSelect.appendChild(option)
            
            for (let key in data.result) {
                let option = document.createElement("option")
                option.setAttribute('value', data.result[key].expertise)
                let optionText = document.createTextNode( data.result[key].expertise )
                option.appendChild(optionText)
                cSelect.appendChild(option)
            }
            cSelect.focus()
            
           
            
        })
        .catch((error) => {
            util.Toast(`Error:, ${error}`,1000)
            console.error('Error:', error)
        })
    },

    filterBy:(val)=>{
        zonked.getAllDoctors("1", val)
    },

    expertise_container:(val)=>{

        if(zonked.aExpert.includes(val)){
            //delete
            const pos= zonked.aExpert.indexOf(val)
            zonked.aExpert.splice(pos, 1)
        }else{
            zonked.aExpert.push(val)    
        }
        document.getElementById('expertise_container').value = zonked.aExpert.join()
    },

    shifter:(val)=>{
        if(val=="doctor"){

            document.getElementById('final_expertise').innerHTML = 
                `<div class="col-lg mb-3">
                    <div class="form-outline">
                        <label class="form-label mb-0" for="expertise_type">Expertise</label>
                        <textarea readonly rows="4" class="form-control" id="expertise_container" name="expertise_container">
                        </textarea>
                    </div>
                </div> `
            
            let txt=`
            <div class="col-lg mb-3">
                <div class="form-outline">
                    <label class="form-label mb-0" for="expertise_type">Select Single or Multiple Expertise, Repeat "click" to Delete</label>
                    <div class="list-group">
                         <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Gynecologic Oncology">Gynecologic Oncology</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Reproductive Endocrinology and Infertility">Reproductive Endocrinology and Infertility</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Maternal-Fetal Medicine">Maternal-Fetal Medicine</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Critical Care Medicine">Critical Care Medicine</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Complex Family Planning">Complex Family Planning</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Hospice and Palliative Medicine">Hospice and Palliative Medicine</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Female Pelvic Medicine and Reconstructive Surgery">Female Pelvic Medicine and Reconstructive Surgery</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Menopausal and Geriatric Gynecology">Menopausal and Geriatric Gynecology</button>
                        <button onclick="javascript:zonked.expertise_container( this.value )"  class="list-group-item list-group-item-action" value="Minimally Invasive Gynecologic">Minimally Invasive Gynecologic</button>
                    </div>
                </div>
            </div>`

            document.getElementById('expert-row').innerHTML = txt
        }else{
            document.getElementById('expert-row').innerHTML= ""
            document.getElementById('final_expertise').innerHTML= ""          
        }//endif
    },

    //======main func get all store projects=====
    getAllDoctors: async (nPage,expertise)=>{
        console.log('==running getAllDoctors()')
        zonked.notif('Loading data pls wait...','p-notif',false)
        
        await fetch(`https://osndp.onrender.com/getalldoctors/${expertise}/3/${nPage}`,{
            cache:'reload'
        })
        .then(res => res.text() )
        .then(text => {

            const texts =`<div class="container-fluid">
                <div>${text}</div>
                </div>
                `

            document.getElementById('site_info').innerHTML = texts

            console.log( '**rec count** ',document.getElementById('reccount').innerHTML)
            zonked.notif('','p-notif',true)
            util.scrollsTo('dashboard')
        })  
        .catch((error) => {
            zonked.notif('','p-notif',true)
            //util.Toast(`Error:, ${error}`,1000)
            console.error('Error:', error)
        })    
    },
    
    //======get patient booking 
    getpatientBooking: async(doc_id)=>{

        console.log('fired ==== getpatientbooking() ')
   
        fetch(`https://osndp.onrender.com/getpatienthistory/${util.getCookie('f_userid')}`)
        .then((response) => {  //promise... then
            return response.text();
        })
        .then((text) => {
            document.getElementById('dashboard').innerHTML=""
            let txt =`
            <div class="container-fluid mt-0" id="current_projects"><br><br>
                <br> 
                <div class="mbr-section-head" id="xhead">
                    <h3 class="mbr-section-title mbr-fonts-style align-center  display-2">
                        <strong>Patient Booking</strong>
                    </h3>
                </div>
                <div class="card">
                    <div class="card-body">
                        <p id='p-notif' class="mb-0"> </p>
                       <div class='row'>
                            <div id='history'>${text}</div>
                        </div>
                    </div>
                </div>
                
                <br>
            </div>`

            document.getElementById('dashboard').innerHTML = txt 
            util.scrollsTo('dashboard')
        })
        .catch((error) => {
            console.error('Error:', error)
        })
        
        

    },

    //======main func get all store projects=====
    getdoctorSched: async (doc_id,doc_name)=>{
        console.log('==running getDOCTORSCHED()')
        //zonked.notif('Loading data pls wait...','p-notif',false)
        await fetch(`https://osndp.onrender.com/getdoctorsched/${doc_id}/${doc_name}`,{
            cache:'reload'
        })
        .then(res => res.text() )
        .then(text => {

            document.getElementById('calendar-info').innerHTML = text
            
        })  
        .catch((error) => {
            
            console.error('Error:', error)
        })    
    },

    notif:(msg, div_id, xclear)=>{
        if(!xclear){
            document.getElementById(div_id).innerHTML = `<i id='i-notif' class='fa fa-spinner fa-pulse' ></i>
            &nbsp;<span id='s-notif'>${msg}</span>`
        }else{
            document.getElementById(div_id).innerHTML = ""
        }
    },

    removeOptions:( selectElement ) => {
        let i, L =selectElement.options.length -1;
        for(i = L; i>=0; i--){
            selectElement.remove(i)
        }
    },
    // get all doctors schedule
    getCalendar:async()=>{
        console.log( '=== getCalendar()===')
        let sched = `
        <div class="row row-striped">
			<div class="col-2 text-right text-nowrap">
				<h1 class="display-4"><span class="badge badge-secondary">23</span></h1>
				<h2>OCT</h2>
			</div>
			<div class="col-10">
				<h3 class="text-uppercase"><strong>Ice Cream Social</strong></h3>
				<ul class="list-inline">
				    <li class="list-inline-item"><i class="fa fa-calendar-o" aria-hidden="true"></i> Monday</li>
					<li class="list-inline-item"><i class="fa fa-clock-o" aria-hidden="true"></i> 12:30 PM - 2:00 PM</li>
					<li class="list-inline-item"><i class="fa fa-location-arrow" aria-hidden="true"></i> Cafe</li>
				</ul>
				<p>Lorem ipsum dolsit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			</div>
		</div>
		<div class="row row-striped">
			<div class="col-2 text-right" text-nowrap>
				<h1 class="display-4"><span class="badge badge-secondary">27</span></h1>
				<h2>OCT</h2>
			</div>
			<div class="col-10">
				<h3 class="text-uppercase"><strong>Operations Meeting</strong></h3>
				<ul class="list-inline">
				    <li class="list-inline-item"><i class="fa fa-calendar-o" aria-hidden="true"></i> Friday</li>
					<li class="list-inline-item"><i class="fa fa-clock-o" aria-hidden="true"></i> 2:30 PM - 4:00 PM</li>
					<li class="list-inline-item"><i class="fa fa-location-arrow" aria-hidden="true"></i> Room 4019</li>
				</ul>
				<p>Lorem ipsum dolsit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
			</div>
		</div>
        `
        document.getElementById('calendar-info').innerHTML = sched
    },


    init: async () => {
       
        console.log('====DEVICE READY===')
    
        zonked.speaks = (txt) =>{
            let speechsynth = new SpeechSynthesisUtterance();
            speechsynth.text = txt
            speechsynth.lang = "en-US"
            speechSynthesis.speak( speechsynth )
        };
        
        zonked.socketID = util.generateRandomDigits(4)
        
        //change menu
        let xdiv = document.getElementById("navbarSupportedContent")
            
        if(util.getCookie("fname")!==""){
            
            xdiv.innerHTML = `<ul class="navbar-nav nav-dropdown nav-right" data-app-modern-menu="true" id="menulist" name="menulist">
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#aboutus">
                        About us
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#features">
                    Services
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#contacts">
                    Contact Us
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#login">
                    Login
                </a>
            </li>
            </ul>`
                    
        }else{
            xdiv.innerHTML = `<ul class="navbar-nav nav-dropdown nav-right" data-app-modern-menu="true" id="menulist" name="menulist">
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#aboutus">
                        About us
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#features">
                    Services
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#contacts">
                    Contact Us
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#register">
                    Signup
                </a>
            </li>
            </ul>`
        }

        console.log('//GETTING PERMISSION')
        const permissions = cordova.plugins.permissions;

        permissions.requestPermission(permissions.CAMERA, success, error);
        
        function error() {
          alert('Camera permission is not turned on');
        }

        function success( status ) {
          if( !status.hasPermission ){
            error();
          }else{
            zonked.playVideoFromCamera()
          }
          
        } 
        //validateform
        util.loadFormValidation('#loginForm')
        util.loadFormValidation('#registerform')
        
    }//end init

}//end zonked obj

window.scrollTo(0,0);//

//zonked.init()

document.addEventListener('deviceready',zonked.init, false);

