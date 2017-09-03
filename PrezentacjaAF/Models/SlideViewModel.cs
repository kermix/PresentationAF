using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace PrezentacjaAF.Models
{
    public class SlideViewModel : Models.Slide
    {
        [Display(Name = "Praca")]
        public IFormFile PhotoFile { get; set; }
        [Display(Name = "Podkład")]
        public IFormFile MusicFile { get; set; }
    }
}
