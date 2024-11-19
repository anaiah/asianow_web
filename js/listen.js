
// Gcash modal listener
$('#gcashmodal').on('show.bs.modal', function (event) {

    //disable close button
    const closebtn = document.getElementById('close-btn')

    closebtn.disabled = true
    closebtn.classList.add('hide-me')

    const iframe = document.getElementById('gcash')

    zonked.refno = zonked.gcashdata.data.attributes.reference_number
    util.setCookie('refno', zonked.refno)
    
    zonked.refnobtnidx = zonked.btnidx //get which button pressed

    iframe.height=window.innerHeight - 160
    iframe.src = zonked.gcashdata.data.attributes.checkout_url

    console.log('==GCASH REFNO====',zonked.refno)
    document.getElementById(`gcash-btn-${zonked.btnidx}`).innerHTML='<i class="fa fa-money"></i>&nbsp;Pay GCASH'
        
    return true
})


$('#gcashmodal').on('hidden.bs.modal', function (event) {
    console.log('exit blues...')

    zonked.checkGcash(zonked.refno)

})

// Calendar
$('#calendarmodal').on('show.bs.modal', function (event) {
    console.log('ayooowwwnnn')
    //zonked.getCalendar()
})

$('#calendarmodal').on('hide.bs.modal', function (event) {
    console.log('tago  pre')
    //zonked.getCalendar()
})