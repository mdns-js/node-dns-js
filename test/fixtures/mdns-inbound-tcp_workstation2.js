{ header: 
   { id: 0,
     qr: 1,
     opcode: 0,
     aa: 1,
     tc: 0,
     rd: 0,
     ra: 0,
     res1: 0,
     res2: 0,
     res3: 0,
     rcode: 0 },
  question: [ { name: '_workstation._tcp.local', type: 12, class: 1 } ],
  answer: 
   [ { name: '_workstation._tcp.local',
       type: 12,
       class: 1,
       ttl: 10,
       data: 'vestri [28:c6:8e:34:b8:c3]._workstation._tcp.local' },
     { name: 'vestri [28:c6:8e:34:b8:c3]._workstation._tcp.local',
       type: 16,
       class: 1,
       ttl: 10,
       data: [ '' ] },
     { name: 'vestri [28:c6:8e:34:b8:c3]._workstation._tcp.local',
       type: 33,
       class: 1,
       ttl: 10,
       priority: 0,
       weight: 0,
       port: 9,
       target: 'vestri.local' },
     { name: 'vestri.local',
       type: 28,
       class: 1,
       ttl: 10,
       address: 'fe80:0:0:0:2ac6:8eff:fe34:b8c3' },
     { name: 'vestri.local',
       type: 1,
       class: 1,
       ttl: 10,
       address: '10.100.0.99' } ],
  authority: [],
  additional: [],
  edns_options: [],
  payload: undefined }