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
        [Display(Name = "Tytuł")]
        public string Title { get; set; }
        [Required]
        [Display(Name = "Opis")]
        public string Description { get; set; }
        public string PhotoPath { get; set; }
        public string MusicPath { get; set; }
        [Range(0, Byte.MaxValue)]
        public byte SlideLength { get; set; }
        [Range(0, Byte.MaxValue)]
        [Display(Name = "Kolejność")]
        public byte SortOrder { get; set; }
        [Display(Name = "Notatka")]
        public string Notice { get; set; }


    }
}
