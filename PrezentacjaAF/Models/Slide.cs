using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PrezentacjaAF.Models
{
    public class Slide
    {
        public int ID { get; set; }
        [Required]
        [Display(Name = "Title")]
        public string Title { get; set; }
        [Required]
        [Display(Name = "Description")]
        public string Description { get; set; }
        public string PhotoPath { get; set; }
        public string MusicPath { get; set; }
        public byte SlideLength { get; set; }
        [Range(0, Byte.MaxValue)]
        [Display(Name = "Order")]
        public byte SortOrder { get; set; }
        [Display(Name = "Notice")]
        public string Notice { get; set; }


    }
}
