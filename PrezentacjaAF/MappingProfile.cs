using AutoMapper;
using PrezentacjaAF.Models;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Slide, SlideViewModel>();
        CreateMap<SlideViewModel, Slide>();
    }
}