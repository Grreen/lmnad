import os
import numpy
import zipfile

import matplotlib.pyplot as plt

from MITgcmutils import mds

from PIL import Image

def CheckZip(pathToFile):
    return zipfile.is_zipfile(pathToFile)

def GetSourceDirectory(pathToFile):
    path, expansion = os.path.splitext(str(pathToFile))
    return path

def GetResultDirectory(pathToDirectory):
    if pathToDirectory[-1] == '/':
        return '/'.join(pathToDirectory.split('/')[:-3]) + '/result'

    return '/'.join(pathToDirectory.split('/')[:-2]) + '/result'

def UnpackFile(pathToFile, pathToDirectory):
    with zipfile.ZipFile(pathToFile, 'r') as zip_file:
        zip_file.extractall(pathToDirectory)

def GetFields(pathToDirectory):
    fields = []

    if 0 < len(mds.scanforfiles(f'{pathToDirectory}/T')):
        fields.append('T')
    
    if 0 < len(mds.scanforfiles(f'{pathToDirectory}/V')):
        fields.append('V')

    if 0 < len(mds.scanforfiles(f'{pathToDirectory}/W')):
        fields.append('W')

    if 0 < len(mds.scanforfiles(f'{pathToDirectory}/U')):
        fields.append('U')

    if 0 < len(mds.scanforfiles(f'{pathToDirectory}/PNH')):
        fields.append('PNH')

    return fields

def SaveDataField(pathToDirectory, field):
    data = []

    if 'v' == field:
        U = mds.rdmds(f'{pathToDirectory}/U', numpy.NaN).squeeze()
        V = mds.rdmds(f'{pathToDirectory}/V', numpy.NaN).squeeze()
        data = (U**2) * (V ** 2)
    else:
        data = mds.rdmds(f'{pathToDirectory}/{field}', numpy.NaN).squeeze()

    if 'T' == field:
        colorbar_title = 'kg/m^3'
        drho1 = 1022.56 - 997.87
        data = 1022.56 - drho1/2 - data
        data = data + 1022.56 - drho1/2
    elif 'V' == field or 'U' == field or 'v' == field:
        colorbar_title = 'm/c'
    elif 'PNH' == field or 'W' == field:
        colorbar_title = 'H/m'
    else:
        colorbar_title = ''

    dataX = mds.rdmds(f'{pathToDirectory}/XG').squeeze()
    dataY = mds.rdmds(f'{pathToDirectory}/RC').squeeze()

    dataX1, dataY1 = numpy.meshgrid(dataX, dataY)

    result_directory = GetResultDirectory(pathToDirectory)
    result_field_directory = f'{result_directory}/{field}'

    if not os.path.exists(result_directory):
        os.mkdir(result_directory)

    if not os.path.exists(result_field_directory):
        os.mkdir(result_field_directory)

    frames = []
    colored_matrix = []

    for index in range(len(data)):

        if 'T' == field:
            colored_matrix = plt.pcolor(dataX1, dataY1, data[index,:,:], vmin=990, vmax=1022)
            plt.contour(dataX1, dataY1, data[index,:,:], levels=[995, 1000, 1022], color='black')
        else:
            colored_matrix = plt.pcolor(dataX1, dataY1, data[index,:,:])
            plt.contour(dataX1, dataY1, data[index,:,:], color='black')

        color_bar = plt.colorbar(colored_matrix)
        color_bar.ax.axes.set_title(colorbar_title)

        plt.xlabel('X, m')
        plt.ylabel('Y, m')

        plt.title(f'{field}, t = {round(index * 0.00625, 3)} sec')

        path_to_image = f'{result_field_directory}/{field}-{index + 1}.png'

        plt.savefig(path_to_image)

        plt.clf()

        frames.append(Image.open(path_to_image))

    frames[0].save(f'{result_field_directory}/animation.gif', format='GIF', append_images=frames[1:], save_all=True, duration=50)

    return result_field_directory.split('project')[-1], len(data)

def GetIsopycns(Z, rho, zpyc, drho):
    rho.remove(1)
    rho.remove(-1)

    index, conti[:,:,1] = min(abs(rho - drho), [], 2) 

def SaveWaveForm(pathToDirectory):
    fieldT   = mds.rdmds(f'{pathToDirectory}/T', numpy.NaN).squeeze()
    X        = mds.rdmds(f'{pathToDirectory}/XG', numpy.NaN).squeeze()
    Y        = mds.rdmds(f'{pathToDirectory}/RC', numpy.NaN).squeeze()

    data = GetIsopycns(Y, fieldT, 1022, 1022)

def GetRichardson(T, U, Y):
    T0 = numpy.zeros((1, len(T[0])))

    for index in range(len(T[0])):
        T0[index] = numpy.mean(T[:,index,:])

    diff_T0 = numpy.diff(T0)
    diff_z = -numpy.diff(Y)
    diff_TO_dz = numpy.zeros(len(diff_T0))
    diff_TO_dz[2:len(T[0])] = numpy.divide(diff_T0, diff_z)
    
    N2 = abs(numpy.divide(numpy.multiply(9.8, diff_TO_dz), T0))

    # N2 = numpy.transpose(N2)

    szdim1 = len(U)
    szdim2 = len(U[0])
    szdim3 = len(U[0][0])

    d_u = numpy.diff(U, 1)
    d_z = -numpy.diff(Y)
    du_dz = numpy.zeros(len(d_u))

    for i in range(szdim1):
        for j in range(szdim3):
            du_dz[i, 2:szdim2, j] = numpy.divide(d_u[i,:,j], numpy.transpose(d_z))

    U2 = numpy.multiply(du_dz, du_dz)

    Rich = numpy.zeros(szdim1, szdim2, szdim3)

    for i in range(szdim1):
        for j in range(szdim3):
            du_dz_z = U2[i,:,j]
            Rich[i,:,j] = numpy.divide(N2, numpy.transpose(du_dz_z))

    return Rich

def SaveRichardson():
    X = mds.rdmds(f'{pathToDirectory}/XG', numpy.NaN).squeeze()
    Y = mds.rdmds(f'{pathToDirectory}/RC', numpy.NaN).squeeze()

    fieldT   = mds.rdmds(f'{pathToDirectory}/T', numpy.NaN).squeeze()
    fieldU   = mds.rdmds(f'{pathToDirectory}/U', numpy.NaN).squeeze()

    drho1 = 1022.56 - 997.87
    fieldT = 1022.56 - drho1/2 - fieldT
    fieldT = fieldT + 1022.56 - drho1/2

    Ri = GetRichardson(fieldT, fieldU, Y)




