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
        [Required(ErrorMessage = "{0} is required.")]
        [Display(Name = "Title")]
        public string Title { get; set; }
        [Display(Name = "Description")]
        public string Description { get; set; }
        public string PhotoPath { get; set; }
        public string MusicPath { get; set; }
        public byte SlideLength { get; set; }
        [Required(ErrorMessage = "{0} is required.")]
        [Range(0, Byte.MaxValue, ErrorMessage = "{0} value must be between {1} and {2}.")]
        [Display(Name = "Order")]
        public byte SortOrder { get; set; }
        [Display(Name = "Notice")]
        public string Notice { get; set; }


    }
}
