class Core {
    static scripts = [
        
    ];

    static load(document, f = () => { }) {
        var amount = this.scripts.length;
        for (let i = 0; i < this.scripts.length; i++) {
            const script = this.scripts[i];
            var elem = document.createElement('script');
            elem.src = script + "?key=" + Math.floor(Math.random() * 101);
            document.head.appendChild(elem);
            elem.onload = ()=>{
                amount--;
                if(amount <= 0){
                    f();
                }
            };
        }
    }
}
