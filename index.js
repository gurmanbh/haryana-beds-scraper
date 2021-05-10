const minCity = 1
const maxCity = 22

const url = 'https://coronaharyana.in/?city='

const cheerio = require('cheerio')
const request = require('request')
const io = require('indian-ocean')
const time = require('d3-time-format')
const timeParse = time.timeParse('%I:%M %p %e %B,%y')
const timeF = time.timeFormat('%Y-%m-%d %H:%M')


const data = []

const run = async(selectedCity) => {

	request(url+selectedCity, async function (err, response, body) {
	    if (!err && response.statusCode == 200){
	    	// get the body
	        var $ = cheerio.load(body);
	        // get the response
	        const children = ($('#containner0-tab').children('.psahuDiv'))
	        let maxTime
	        for (let index = 0; index < children.length; index++){
	        	
	        	let o = {}
	        	let c = children[index]

	        	o.name = ($($(c).find('h6')[0]).html().split(':')[1]).trim()
	        	o.address = ($($(c).find('h6')[0]).attr('title')).trim()

	        	let p = ($($(c).find('p')[0]).text().trim().replace(/\n/g,' ').split(','))
	        	p.forEach(d=>{
	        		let s = d.split(":")
	        		if (s[1]){
	        			o['Availability_'+slugify(s[0].trim())] = s[1].trim()
	        		}	        		
	        	})

	        	let div = ($($(c).find('div')[3]).text().trim().replace(/\n/g,' ').replace('Allocated Beds: ','').split(','))
	        	div.forEach(d=>{
	        		let s = d.split(":")
	        		if (s[1]){
	        			o['Allocated_'+slugify(s[0].trim())] = s[1].trim()
	        		}	        		
	        	})

	        	let div2 = ($($(c).find('div')[4]).text().trim().replace(/\n/g,' ').replace('Availability of Drugs',',').split('Helpline')[0].split(','))
	        	div2.forEach(d=>{
	        		let s = d.split(":")
	        		if (s[1]){
	        			o['Availability_'+slugify(s[0].trim())] = s[1].trim()
	        		}	        		
	        	})

	        	let li = ($($(c).find('li')[0]).text().trim().replace('Updated On: ',''))
	        	let t = (timeParse(li.replace(/([0-9]+)(st|nd|rd|th)/,'$1').replace(/^([0-9]:)/,'0$1')))
	        	o.updated_on = timeF(t)
	        	if (!maxTime){
	        		maxTime = t
	        	} else {
	        		if (maxTime < t){
	        			maxTime = t
	        		}
	        	}

	        	o.city = selectedCity

				data.push(o)

				if(index === children.length-1 && selectedCity===maxCity){
					io.writeDataSync(`data/${timeF(maxTime)}.csv`, data)
				}
	        }

	        
		} else {
			console.log('Page down')
		}
	})
}

function slugify (string) {
    return string.replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
}

for (let i=minCity; i<=maxCity; i++){
	run(i)
}
run()