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
        [Display(Name = "Photo")]
        public IFormFile PhotoFile { get; set; }
        [Display(Name = "Music")]
        public IFormFile MusicFile { get; set; }
    }
}
