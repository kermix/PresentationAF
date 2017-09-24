using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PrezentacjaAF.Models
{
    public class Section
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Tag { get; set; }
        public byte Order { get; set; }
        public bool IsSlideshow { get; set; }

        public virtual List<Slide> Slides {get; set;}
    }
}
