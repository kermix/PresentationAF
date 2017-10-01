using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PrezentacjaAF.Models
{
    public class Section
    {
        public int Id { get; set; }
        [Display(Name = "Name")]
        public string Name { get; set; }
        public string Tag { get; set; }
        [Display(Name = "Order")]
        public byte Order { get; set; }
        [Display(Name = "Is it slideshow?")]
        public bool IsSlideshow { get; set; }

        public virtual List<Slide> Slides {get; set;}
    }
}
