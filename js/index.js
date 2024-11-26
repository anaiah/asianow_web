/*

author: Carlo O. Dominguez

*/

//let messagesEl = document.querySelector('.xmessages');
let conn = null;
let  remoteStream, oData = {}, doctorID = ""
       
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
    doctor_found:0,
    //******  THIS  IS FOR VIDEO.JS */
   
    callDoctor: (drname,caseno) => {

        oData.doctor = drname
        oData.caseno = caseno
        oData.patient = util.getCookie('fname')
        zonked.socket.emit('dial', JSON.stringify(oData))
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
            /// for offline test -> util.speak(data.voice)
            zonked.speaks(data.voice)
            //clear dashboard again
            zonked.getapprovalReg()

            return true

        })
        .catch((error) => {
            console.error('Error:', error)
        })
    },

    //get all for approval
    getapprovalReg: async()=>{
        console.log('fired===getapprovalReg()')
        fetch(`https://osndp.onrender.com/getapprovalreg`)
        //fetch(`http://192.168.54.221:10000/getapprovalreg`)
        
        .then((response) => {  //promise... then
            return response.text();
        })
        .then((text) => {
            const txt = `
            <div class="container-fluid mt-0" id="current_projects"><br><br>
                <div class="mt-0 mb-10 shadow-sm " style="border-radius:10px;background-color:white">
                <br> 
                    <div class="mbr-section-head" id="xhead">
                        <h3 class="mbr-section-title mbr-fonts-style align-center  display-2">
                            <strong>Admin Dashboard</strong>
                        </h3>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <p id='p-notif' class="mb-0"> </p>
                            <div class="row">
                                <div class="container-fluid">
                                    <div class="ml-3 mbr-section-head"><br><br>
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

            return true

        })
        .catch((error) => {
            console.error('Error:', error)
        })
    },

    //tag delivry
    tagDelivery: async( deliveryId, branch)=>{
        fetch(`${ipconfig}/asia/tagdelivery/${deliveryId}/${document.getElementById('branch').value}}`)
        .then((response) => {  //promise... then
            return response.json();
        })
        .then((data) => {

            Toastify({
                text: data.message,
                duration:3000,
                close:false,
                position:'center',
                offset:{
                    x: 0,
                    y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                },
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
           
            zonked.speaks(data.voice) 

            zonked.insertDelivery()

        })
        .catch((error) => {
            console.error('Error:', error)
        })
    }, 
    
    //====CRON JOB TO GET DASHBOARD===
    cronJob: () =>{
        setInterval( zonked.insertDashboard, 10000 );
    },



    //BENNY BERNABE
    insertDashboard: async ()=>{//called by filterbyexpertise()  for patient history
        console.log('fired=== dashboard')
        //fetch(`https://osndp.onrender.com/gethistory/${util.getCookie('f_userid')}`)
        fetch(`${ipconfig}/asia/getdashboard`)
        .then((response) => {  //promise... then
            return response.text();
        })
        .then((text) => {

            document.getElementById('dashboard').innerHTML = "" 

            const txt = `<div class="container-fluid">
                <div>${text}</div>
                </div>`
            document.getElementById('dashboard').innerHTML = txt

            return true

        })
        .catch((error) => {
            console.error('Error:', error)
        })
    },

    //pls add to mobile
    insertDelivery: async ()=>{//called by filterbyexpertise()  for patient history
        console.log('fired=== insertHisttory(v2)==')
        //fetch(`https://osndp.onrender.com/gethistory/${util.getCookie('f_userid')}`)
        fetch(`${ipconfig}/asia/getdelivery/${util.getCookie('f_userid')}/${document.getElementById('branch').value}`)
        .then((response) => {  //promise... then
            return response.text();
        })
        .then((text) => {

            document.getElementById('history').innerHTML = "" 

            const txt = `<div class="container-fluid">
                <div>${text}</div>
                </div>`
            document.getElementById('history').innerHTML = txt

            return true

        })
        .catch((error) => {
            console.error('Error:', error)
        })
    }, 

    insertSection: async()=>{ // for patient,  get doctor
        console.log('fired==== insertSection()')

        document.getElementById('dashboard').innerHTML = ""

        let xtxt = `<!--//CURRENT PROJECTS//-->
        <div class="container-fluid mt-0" id="current_projects"><br><br>

           <div class="mbr-section-head" id="xhead">
                <h3 class="mbr-section-title mbr-fonts-style align-center  display-2">
                    <strong>Rider's Dashboard</strong>
                </h3>
            </div>
            <div class="card">
                <div class="card-body">
                    <p id='p-notif' class="mb-0"> </p>
                    
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
        //zonked.filterExpertise('https://osndp.onrender.com/filterexpertise', document.getElementById('expertise_type'))
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
            return true

           
            
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
            document.getElementById('doc_license').innerHTML =
                `<div class="col-lg mb-3">
                    <div class="form-outline">
                        <label class="form-label mb-0" for="license">License No.</label>
                        <input type='text' class="form-control regx" id="license" name="license">
                        </textarea>
                    </div>
                </div> `
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
            document.getElementById('doc_license').innerHTML =
            document.getElementById('expert-row').innerHTML= ""
            document.getElementById('final_expertise').innerHTML= ""          
        }//endif
    },

    //==== FOR ADMIN REPORT PLS ADD TO MOBILE====//
    getreport: async()=>{
        //await fetch(`http://192.168.182.221:10000/getreport`)
        await fetch(`https://osndp.onrender.com/getreport`)
        
        .then( (response) => {
            return response.json() // if the response is a JSON object
        })
        .then( (data) =>{
            if(data.status){

                let  txt = "<b>OVU Total Registered<b><br><br>"

                let grp = ""

                console.log(data.xdata)

                data.xdata.forEach( (element) => {
                    //console.log(element.grp_id)
                    txt += `${element.grp_id} : ${element.count}<br>`
                })

                txt += `<button type='button' id='confirmClose' class='btn btn-primary'>Close</button>`
            
                Toastify({
                    text: txt,
                    duration:0,
                    escapeMarkup:false,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();

                $('#confirmClose').on('click', function () {
                    var xxx = document.querySelector('.toastify')
                    xxx.classList.add('hide-me')

                });
                
            }
            return true
        })
        .catch((error) => {
            console.error('Error:', error)
        })
     
    },

    //======main func get all store projects=====
    getAllDoctors: async (nPage,expertise)=>{
        console.log('==running getAllDoctors()')
        zonked.notif('Loading data pls wait...','p-notif',false)

        document.getElementById('site_info').innerHTML = "" //reset
        
        await fetch(`https://osndp.onrender.com/getalldoctors/${expertise}/3/${nPage}`,{
        //await fetch(`http://192.168.117.140:10000/getalldoctors/${expertise}/3/${nPage}`,{
        
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

            return true
        })  
        .catch((error) => {
            zonked.notif('','p-notif',true)
            //util.Toast(`Error:, ${error}`,1000)
            console.error('Error:', error)
        })    
        
    },
    
    //======get patient booking 
    //====pls add to mobile
    getpatientBooking: async(nPage,doc_id,caseno)=>{
        if(caseno==""){
            caseno = 0
        }

        console.log('fired ==== getpatientbooking() caseno: ', caseno)
   
        await fetch(`https://osndp.onrender.com/getpatienthistory/${util.getCookie('f_userid')}/${caseno}/${nPage}`)
        //await fetch(`http://192.168.117.140:10000/getpatienthistory/${util.getCookie('f_userid')}/${caseno}/${nPage}`)
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

            return true

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
        //await fetch(`http://192.168.117.140:10000/getdoctorsched/${doc_id}/${doc_name}`,{
            cache:'reload'
        })
        .then(res => res.text() )
        .then(text => {

            document.getElementById('calendar-info').innerHTML = text
            return true    
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
    //=========Gcash vars
    refno:null,
    refnobtnidx:"0",
    gcashdata:null,
    btnidx:null,

    paygcash:(caseno,patient,idx)=>{
        
        zonked.btnidx = idx
                
        console.log('---loading paygcash() again---')

        let obj = { data:{ attributes: {}}}
        obj.data.attributes.amount = 150000
        obj.data.attributes.description = `OVU Healtchcare Case# ${caseno} ${patient} `
        
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: 'Basic c2tfdGVzdF90a3FDZzlzempaQUQxOWNHRDczclpZMmQ6'
            },
            body: JSON.stringify(obj)
        }


        fetch('https://api.paymongo.com/v1/links', options)
        .then( (response) => {
            return response.json() // if the response is a JSON object
        })
        .then( (data) =>{
            console.log( 'fetch data' )
            zonked.gcashdata = data
            
            util.modalShow( 'gcashmodal')
            //window.location.href = data.data.attributes.checkout_url
            return true

        })
        // Handle the success response object
        .catch( (error) => {
            console.log(error) // Handle the error response object
        });
    },//==== end paygcash =====

    checkGcash:async()=>{
        
        let refno = util.getCookie('refno')

        await fetch(`https://osndp.onrender.com/gcashref/${refno}`)
        .then( (response) => {
            return response.json() // if the response is a JSON object
        })
        .then( (data) =>{

            switch(data.xdata.status.toUpperCase()){
                case "UNPAID":
                    Toastify({
                        text: `PLS CHECK AGAIN, SERVER UPDATE TAKES A WHILE \n OR YOU'RE NOT DONE YET WITH PAYMENT PROCESS!`,
                        duration:6000,
                        close:false,
                        position:'center',
                        offset:{
                            x: 0,
                            y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                        },
                        style: {
                          background: "linear-gradient(to right, #00b09b, #96c93d)",
                        }
                    }).showToast();
                    return false

                    break     
                 
                case "PAID":
                    console.log('disabling btn')
                    document.getElementById(`call-btn-${zonked.refnobtnidx}`).disabled = false
                    document.getElementById(`gcash-btn-${zonked.refnobtnidx}`).disabled = true
                    document.getElementById(`gcash-btn-${zonked.btnidx}`).innerHTML='<i class="fa fa-thumbs-up"></i>&nbsp;PAID!'
                    
                    const closebtn = document.getElementById('close-btn')
                    closebtn.classList.remove('hide-me')
                    closebtn.disabled = false


                    const checkbtn = document.getElementById('check-btn')
                    checkbtn.classList.add('hide-me')
                    checkbtn.disabled = true
    
                    break;    
            }//endsw
            
            Toastify({
                text: `PAYMENT STATUS: "${data.xdata.status.toUpperCase()}"`,
                duration:3000,
                close:false,
                position:'center',
                offset:{
                    x: 0,
                    y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                },
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
           
            document.getElementById('gcash').src=''
            //zonked.refno = null
            
        })
        // Handle the success response object
        .catch( (error) => {
            console.log(error) // Handle the error response object
        });
    //zonked.getCalendar()
    return true

    },
    //pls add to mobile
    changeoptions:async( cselect )=>{
        const cSelect = cselect

        zonked.removeOptions( cSelect )

        /* TAKE OUT PLS SELECT VALUE*/
        let xoption = document.createElement("option")
        xoption.setAttribute('value', "")
    
        //option.setAttribute('selected','selected')
        let xoptionText = document.createTextNode( "-- Pls Select time--" )
        xoption.appendChild(xoptionText)

        cSelect.appendChild(xoption)
        
        let _xhour = [9,10,11,13,14,15,16,17]
        
        _xhour.forEach( (elem)=>{
            xoption = document.createElement("option")
            xoption.setAttribute('value', elem)
            xoptionText = document.createTextNode(elem+":00" )
            xoption.appendChild(xoptionText)

            cSelect.appendChild(xoption)
    
        })
        return true
    },

    //pls add to mobile
    aSched:[], //array container of schedule

    //pls add to mobile
    changeschedule:async()=>{
        console.log('==show schedule changeschedule()===')
        util.modalShow('changeschedmodal')  
        //pls add to mobile

        zonked.changeoptions( document.getElementById('ch_start'))

        zonked.changeoptions( document.getElementById('ch_end'))
            
    },

    //pls add to mobile
    checktime:async()=>{
        console.log('checking time....')
        if( parseInt(document.getElementById('ch_start').value) >= parseInt(document.getElementById('ch_end').value) ){
            alert('start time, end time error!')
            document.getElementById('sched-btn').disabled = true
            return false
        }else{
            document.getElementById('sched-btn').disabled = false
            return 
        }//edif
    },

    //pls add to mobile
    addschedule:async()=>{
       
        let obj ={}
        
        obj.day = document.getElementById('ch_days').value
        obj.start = document.getElementById('ch_start').value
        obj.end = document.getElementById('ch_end').value

        //if there's already same day, dont add
        const finder = zonked.aSched.findIndex( x => x.day  === obj.day)
        
        if(finder >= 0){ //if found
            //alert(obj.day + " Already found!")

            const butt1 = `${obj.day.toUpperCase() } FOUND!, Would you Like to UPDATE?<br /><button type='button' id='btnYes' class='btn btn-primary'>Update</button>
                &nbsp;<button type='button' id='btnNo' class='btn btn-primary'>Decline</button>`
                        
            Toastify({
                text: butt1,
                duration:0,
                close:false,
                position:'center',
                offset:{
                    x: 0,
                    y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                },
                escapeMarkup:false, //to create html
                style: {
                    
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();

            $('#btnYes').on('click', function () {
                console.log( finder, zonked.aSched)

                var xxx = document.querySelector('.toastify')
                xxx.classList.add('hide-me')

                zonked.aSched.splice(finder, 1)
                zonked.aSched.push( obj )
                zonked.writeSchedule( )

            });

            $('#btnNo').on('click', function () {
                
                var xxx = document.querySelector('.toastify')
                xxx.classList.add('hide-me')
                
                return false
            });

        }else{
            zonked.aSched.push( obj )
            zonked.writeSchedule( )
            //return true
        }
    },

    //pls add to mobile
    writeSchedule:()=>{
        //console.log(  obj,'888object888')

        var table = document.getElementById("table-sched"),
        tbody = table.getElementsByTagName("tbody")[0],
        cell, row

        tbody.innerHTML= ""
        
        //console.log( Object.keys( cam.orx).length )
        
        // helpful also ---> for( let xkey in Object.keys( cam.orx).length ){

        zonked.aSched.forEach( (element) => {
            //====end for
            row = document.createElement("tr");

            cell= document.createElement("td")
            cell.innerHTML = element.day
    
            row.appendChild( cell )
    
            cell= document.createElement("td")
            cell.innerHTML = element.start +":00"+ 
            ( parseInt( element.start ) < 12 ? "a" : "")
            
            row.appendChild( cell )
    
            cell= document.createElement("td")
            cell.innerHTML = element.end +":00" + 
                ( parseInt( element.end ) >= 12 ? "p" : "a")
            
            row.appendChild( cell )
    
            tbody.appendChild( row ) 

        })

        console.log( zonked.aSched)

        //zonked.writeSchedDb( "http://192.168.117.140:10000/writesched", zonked.aSched)
    },

    //===decline patient===//
    declinePatient: ( caseno ) => {
        console.log('declinePatient()', caseno)
        
        //fetch(`http://192.168.117.140:10000/declinepatient/${caseno}`,{
        fetch(`https://osndp.onrender.com/declinepatient/${caseno}`,{
            method:'PUT',
            //cache:'no-cache',
            headers: {
                "Content-Type": "application/json",
            }
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            if(data.status){
                Toastify({
                    text: data.message,
                    duration:4000,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
            }else{ 
                Toastify({
                    text: data.message,
                    duration:4000,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();

                return false
            }
        })
        .catch((error) => {
            // util.Toast(`Error:, ${error.message}`,1000)
            console.error('Error:', error)
        })
    },

    //=== write to db ===
    writeSchedDb: ( url,objdb ) =>{
        fetch(url,{
            method:'PUT',
            //cache:'no-cache',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(objdb)
        })
        .then((response) => {  //promise... then 
            return response.json();
        })
        .then((data) => {
            if(data.status){
                let xform = document.getElementById('changeschedForm')
                xform.reset()
                
                //util.resetFormClass('#registerform')
                Toastify({
                    text: data.message,
                    duration:4000,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
               
            }else{
                
                Toastify({
                    text: data.message,
                    duration:4000,
                    close:false,
                    position:'center',
                    offset:{
                        x: 0,
                        y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                    },
                    style: {
                      background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast();
               
                // brig back online zonked.speaks(data.voice)
                //util.alertMsg(data.message,'warning','equipmentPlaceHolder')
                return false
            }//eif
        })
        .catch((error) => {
        // util.Toast(`Error:, ${error.message}`,1000)
        console.error('Error:', error)
        })

        return true
    },


    //====================MAIN INIT================
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
        let div = document.getElementById("navbarSupportedContent")
            
        if(util.getCookie("fname")!==""){
            
            div.innerHTML = `<ul class="navbar-nav nav-dropdown nav-right" data-app-modern-menu="true" id="menulist" name="menulist">
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#aboutus">
                        About us
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
            div.innerHTML = `<ul class="navbar-nav nav-dropdown nav-right" data-app-modern-menu="true" id="menulist" name="menulist">
            <li class="nav-item">
                <a class="nav-link link text-black display-4" href="#aboutus">
                        About us
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

          
        /*
        const permissions = cordova.plugins.permissions;

        permissions.requestPermission(permissions.CAMERA, success, error);
        
        function error() {
            Toastify({
                text: "<i class='fa fa-exclamation-triangle' aria-hidden='true'></i>  NO Camera Permission!",
                //duration:3000,
                close:false,
                position:'center',
                escapeMarkup:false, //to create html
                offset:{
                    x: 0,
                    y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                },
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
              }).showToast();
        }

        function success( status ) {
          if( !status.hasPermission ){
            error();
          } else{
            Toastify({
                text: "<i class='fa fa-camera'></i>  With Camera Permission!",
                duration:3000,
                close:false,
                position:'center',
                escapeMarkup:false, //to create html
                className:'',
                offset:{
                    x: 0,
                    y:100//window.innerHeight/2 // vertical axis - can be a number or a string indicating unity. eg: '2em'
                },
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
              }).showToast();
               
          }//eif
        }
        */
        //validateform
        util.loadFormValidation('#loginForm')
        //util.loadFormValidation('#registerform')
        //pls add to mobile
        //util.loadFormValidation('#changeschedForm')
        
    }//end init

}//end zonked obj

window.scrollTo(0,0);//

zonked.init()

//document.addEventListener('deviceready',zonked.init, false);

